'use client'

import { fetchLocations, fetchPatterns, getPossiblePatterns, Location, MapInfo, shiftingEarths } from "@/utils/data";
import { useEffect, useState } from "react";
import InteractiveMap from "./map/interactiveMap";

export default function Page() {
    const [mapInfo, setMapInfo] = useState<MapInfo>({ shiftingEarth: shiftingEarths[0], spawnPoint: "", pins: {} })
    const [locations, setLocations] = useState<Location[]>([]);
    const [patterns, setPatterns] = useState<Record<string, string>[]>([]);
    const [currentPatternId, setCurrentPatternId] = useState("")

    const optionList = shiftingEarths.map((se, index) => (
        <label key={index}>
            <input type="radio" name="shiftingEarth" value={se} defaultChecked={index == 0} onInput={() => { handleSelectShiftingEarth(se) }} />
            {<span>{se}</span>}
        </label>
    ))

    const matchedPatterns = getPossiblePatterns(patterns, mapInfo)
    const matchedLinks = matchedPatterns.length > 8 ? null : matchedPatterns.map((pattern, index) => (
        <a key={index} target="_blank"
            onClick={() => handlePatternSelect(pattern["ID"])}
            href={currentPatternId != pattern["ID"] ? undefined : `https://thefifthmatt.github.io/nightreign/pattern/${pattern["ID"]}.jpg`}
            className={`cursor-pointer select-none ${currentPatternId == pattern["ID"] ? "text-blue-800 dark:text-blue-300 underline" : ""} hover:text-blue-400`}
        >
            {`${pattern["ID"]} - ${pattern["Shifting Earth"]} - ${pattern["Nightlord"]}`}
        </a>
    ))

    useEffect(() => {
        fetchLocations().then((data) => {
            setLocations(data)
        })
        fetchPatterns().then((data) => {
            setPatterns(data)
        })
    }, []);

    function handlePatternSelect(patternId: string) {
        setTimeout(() => setCurrentPatternId(patternId))
    }

    function handleSelectShiftingEarth(se: string) {
        mapInfo.shiftingEarth = se
        for (const location of locations) {
            if (!location[se]) {
                if (location.name == mapInfo.spawnPoint) {
                    mapInfo.spawnPoint = ""
                }
                if (mapInfo.pins[location.name] != undefined) {
                    delete mapInfo.pins[location.name]
                }
            }
        }
        handleInfoChange({ ...mapInfo, pins: { ...mapInfo.pins } })
    }

    function handleInfoChange(info: MapInfo) {
        setCurrentPatternId("")
        setMapInfo(info)
    }

    function handleReset() {
        setCurrentPatternId("")
        setMapInfo({ ...mapInfo, spawnPoint: "", pins: {} })
    }

    function handleSkipSpawn() {
        setMapInfo({ ...mapInfo, spawnPoint: mapInfo.spawnPoint == "" ? "Any" : "" })
    }

    return (
        <div className="flex justify-center flex-col md:flex-row w-full mx-4 space-x-4">
            <div className="flex items-start md:items-center flex-col w-full md:w-2xl">
                <form className="flex flex-col md:flex-row md:space-x-2">
                    {optionList}
                </form>
                <InteractiveMap
                    info={mapInfo}
                    patternId={currentPatternId}
                    locations={locations}
                    allPatterns={patterns}
                    onInfoChange={handleInfoChange}
                />
                <div className="flex gap-2 my-1 w-full">
                    <button className="px-1 rounded-md text-black border-2 bg-gray-300 disabled:opacity-75 enabled:hover:bg-gray-400 enabled:active:bg-gray-500" onClick={handleReset}>Reset</button>
                    {mapInfo.spawnPoint.length > 0 && mapInfo.spawnPoint != "Any" ? null : <button className="px-1 rounded-md text-black border-2 bg-gray-300 disabled:opacity-75 enabled:hover:bg-gray-400 enabled:active:bg-gray-500" onClick={handleSkipSpawn}>{mapInfo.spawnPoint == "Any" ? "Set Spawn Point" : "Unknown Spawn Point"}</button>}
                </div>
            </div>
            <div className="flex flex-col w-full md:w-60">
                {matchedLinks}
            </div>
        </div>
    );
}
