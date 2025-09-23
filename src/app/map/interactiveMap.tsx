import { getMajorBaseTypes, getPinTypes, getPossiblePatterns, getPossiblePinValues, Location, MapInfo } from "@/utils/data";
import { FlagTriangleRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import PinDialog from "./pinDialog";

const colorTable: Record<string, string> = {
    "Castle": "#00695C",
    "Major Base": "#00695C",
    "Minor Base": "#F9A825",
    "Evergaol": "#424242",
    "Arena Boss": "#C62828",
    "Field Boss": "#C62828",
    "Rooftop Boss": "#6A1B9A",
    "Nightlord": "#283593",
}

function Circle({
    color,
    x,
    y,
    size,
    selected,
    flag,
    text,
    textPosition,
    onClick,
    onRightClick
}: {
    color: string,
    x: number,
    y: number,
    size: number,
    selected: boolean,
    flag: boolean,
    text?: string,
    textPosition?: "Top" | "Bottom" | "Left" | "Right" | "Center",
    onClick?: (e: React.MouseEvent) => void,
    onRightClick?: (e: React.MouseEvent) => void
}) {
    return (
        <>
            <div
                className={`absolute select-none flex justify-center items-center -translate-1/2 rounded-full border-2 ${selected ? "border-white" : "border-black"} hover:shadow-[0px_0px_8px_0px_white]`}
                onClick={onClick}
                onContextMenu={onRightClick}
                style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: color,
                }}
            >
                {!flag ? null : (
                    <FlagTriangleRight className="text-black" size={`${size * 0.7}px`} strokeWidth="3px" />
                )}
            </div>
            {(() => {
                if (!text) return null
                const align = {
                    "Top": "text-center -translate-x-1/2 -translate-y-full",
                    "Bottom": "text-center -translate-x-1/2",
                    "Center": "text-center -translate-1/2",
                    "Left": "text-right -translate-x-full -translate-y-1/2",
                    "Right": "text-left -translate-y-1/2",
                }[textPosition || "Center"]
                return (
                    <span
                        className={`absolute ${align} break-normal pointer-events-none text-stroke p-0.5`}
                        style={{
                            left: `${x * 100}%`,
                            top: `${y * 100}%`,
                            width: `${size * 3}px`,
                            fontSize: `${size * 0.4}px`,
                            zIndex: 10,
                        }}
                    >
                        {text}
                    </span>
                )
            })()}
        </>
    );
}

export default function InteractiveMap({ info, patternId, locations, allPatterns, onInfoChange }: {
    info: MapInfo,
    patternId: string,
    locations: Location[],
    allPatterns: Record<string, string>[],
    onInfoChange?: (info: MapInfo) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(0);
    const [dialogItemTable, setDialogItemTable] = useState<string[][]>([]);
    const [currentLocationName, setCurrentLocationName] = useState("")

    const pinnedLocations = locations.map((location, index) => {
        if (!location[info.shiftingEarth]) {
            return null
        }
        if (info.spawnPoint == "" && !location.spawn) {
            return null
        }
        const text = patternId != "" ?
            allPatterns[parseInt(patternId)][location.name] :
            info.pins[location.name] != "Any" ?
                info.pins[location.name] :
                undefined
        return (
            <Circle
                key={index}
                color={colorTable[location.name == "Field Boss - Castle Rooftop" ? "Rooftop Boss" : location.type]}
                x={location.x}
                y={location.y}
                size={location.name == "Nightlord" ? containerSize * 0.08 : containerSize * 0.05}
                selected={info.pins[location.name] != undefined && info.pins[location.name] != "Any"}
                flag={location.spawn && (info.spawnPoint == "" || location.name == info.spawnPoint)}
                text={text}
                textPosition={location.textPosition}
                onClick={(e) => { e.stopPropagation(); handleCircleClick(location) }}
                onRightClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCircleRightClick(location) }} />
        )
    })

    useEffect(() => {
        // Size adaption
        const updateSize = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                setContainerSize(width);
            }
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    function handleCircleRightClick(location: Location) {
        if (!onInfoChange) {
            return
        }
        if (location.spawn && location.name == info.spawnPoint) {
            info.spawnPoint = ""
        }
        info.pins[location.name] = "Any"
        onInfoChange({ ...info });
    }

    function handleCircleClick(location: Location) {
        if (!onInfoChange) {
            return
        }
        if (info.spawnPoint == "") {
            info.spawnPoint = location.name
            onInfoChange({ ...info });
            return
        }

        setCurrentLocationName(location.name)
        const patterns = getPossiblePatterns(allPatterns, {
            shiftingEarth: info.shiftingEarth,
            spawnPoint: info.spawnPoint,
            pins: { ...info.pins, [location.name]: "Any" }
        })
        const pinValues = getPossiblePinValues(patterns, location.name).sort()
        if (location.type == "Major Base") {
            const majorBaseTypes = pinValues.length > 1 ? getMajorBaseTypes(pinValues) : []
            const pinTypes = majorBaseTypes.length > 1 ? getPinTypes(pinValues) : []
            setDialogItemTable([
                pinTypes,
                majorBaseTypes,
                pinValues,
            ])
        } else if (location.type == "Minor Base") {
            setDialogItemTable([
                pinValues.length > 1 ? getPinTypes(pinValues) : [],
                pinValues,
            ])
        } else {
            setDialogItemTable([
                pinValues,
            ])
        }
    }

    function handleDialogSelect(value: string) {
        setCurrentLocationName("")
        setDialogItemTable([])
        if (value.length == 0 || !onInfoChange) return
        onInfoChange({
            shiftingEarth: info.shiftingEarth,
            spawnPoint: info.spawnPoint,
            pins: { ...info.pins, [currentLocationName]: value },
        })
    }

    return (
        <>
            <div ref={containerRef} className="relative w-full aspect-square">
                <Image
                    className="rounded-md"
                    src={`/nightreign-seed-search/maps/${info.shiftingEarth}.webp`}
                    alt="Map"
                    width={800}
                    height={800}
                    priority={true}
                    style={{ width: '100%', height: 'auto' }}
                />
                {pinnedLocations}
            </div>
            {dialogItemTable.length > 0 ? <PinDialog itemTable={dialogItemTable} onSelect={handleDialogSelect}></PinDialog> : null}
        </>
    )
}
