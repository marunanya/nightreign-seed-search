import Papa from 'papaparse';

const majorBaseMarkTable: Record<string, string> = {
    "Camp - Banished Knights": "Camp - Normal",
    "Camp - Elder Lion": "Camp - Normal",
    "Camp - Flame Chariots": "Camp - Fire",
    "Camp - Frenzied Flame Troll": "Camp - Frenzy",
    "Camp - Leonine Misbegotten": "Camp - Normal",
    "Camp - Redmane Knights": "Camp - Fire",
    "Camp - Royal Army Knights": "Camp - Lightning",
    "Fort - Abductor Virgin": "Fort - Normal",
    "Fort - Crystalians": "Fort - Magic",
    "Fort - Guardian Golem": "Fort - Normal",
    "Fort - Lordsworn Captain": "Fort - Normal",
    "Great Church - Fire Monk": "Great Church - Fire",
    "Great Church - Guardian Golem": "Great Church - Normal",
    "Great Church - Mausoleum Knight": "Great Church - Normal",
    "Great Church - Oracle Envoys": "Great Church - Holy",
    "Ruins - Albinauric Archers": "Ruins - Frostbite",
    "Ruins - Albinaurics": "Ruins - Holy",
    "Ruins - Ancient Heroes of Zamor": "Ruins - Frostbite",
    "Ruins - Battlemages": "Ruins - Magic",
    "Ruins - Beastmen of Farum Azula": "Ruins - Lightning",
    "Ruins - Depraved Perfumer": "Ruins - Poison",
    "Ruins - Erdtree Burial Watchdogs": "Ruins - Normal",
    "Ruins - Perfumer": "Ruins - Poison",
    "Ruins - Runebear": "Ruins - Sleep",
    "Ruins - Sanguine Noble": "Ruins - Bleed",
    "Ruins - Wormface": "Ruins - Death",
}

export const shiftingEarths = ["Default", "Mountaintop", "Crater", "Rotted Woods", "Noklateo"]

export interface MapInfo {
    shiftingEarth: string,
    spawnPoint: string,
    pins: Record<string, string>,
}

export interface Location {
    name: string,
    type: string,
    spawn: boolean,
    x: number,
    y: number,
    textPosition: "Top" | "Bottom" | "Left" | "Right" | "Center",
    "Default": boolean,
    "Mountaintop": boolean,
    "Crater": boolean,
    "Rotted Woods": boolean,
    "Noklateo": boolean,
    [key: string]: boolean | string | number,
}

export async function fetchLocations() {
    const response = await fetch('/nightreign-seed-search/locations.csv');
    const csvText = await response.text();
    const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data as Record<string, string>[];
    const result: Location[] = []
    for (const row of data) {
        const location: Location = {
            name: row["Location"],
            type: row["Location"].split(" - ")[0],
            spawn: row["Spawn"].length > 0,
            x: parseFloat(row["X"]),
            y: parseFloat(row["Y"]),
            textPosition: row["Text Position"] as "Top" | "Bottom" | "Left" | "Right" | "Center",
            "Default": false,
            "Mountaintop": false,
            "Crater": false,
            "Rotted Woods": false,
            "Noklateo": false,
        }
        for (const shiftingEarth of shiftingEarths) {
            if (row[shiftingEarth].length > 0) {
                location[shiftingEarth] = true;
            }
        }
        result.push(location)
    }
    return result
}

export async function fetchPatterns() {
    const response = await fetch('/nightreign-seed-search/patterns.csv');
    const csvText = await response.text();
    const patterns = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data as Record<string, string>[];
    patterns.forEach(pattern => pattern["ID"] = pattern["ID"].padStart(3, "0"))
    return patterns
}

export function checkPattern(pattern: Record<string, string>, mapInfo: MapInfo, spawnPointShort: string) {
    if (spawnPointShort == "") {
        return false
    }
    if (mapInfo.shiftingEarth != pattern["Shifting Earth"]) {
        return false
    }
    if (spawnPointShort != "Any" && spawnPointShort != pattern["Spawn Point"]) {
        return false
    }
    for (const [locationName, value] of Object.entries(mapInfo.pins)) {
        if (
            value != "Any" &&
            pattern[locationName] != value &&
            majorBaseMarkTable[pattern[locationName]] != value &&
            pattern[locationName].split(" - ")[0] != value
        ) {
            return false
        }
    }
    return true
}

export function getPossiblePatterns(patterns: Record<string, string>[], mapInfo: MapInfo) {
    if (mapInfo.spawnPoint == "") {
        return []
    }
    return patterns.filter(pattern => checkPattern(pattern, mapInfo, mapInfo.spawnPoint.split(" - ")[1] || mapInfo.spawnPoint))
}

export function getPossiblePinValues(patterns: Record<string, string>[], locationName: string) {
    return [...new Set(patterns.map((pattern) => pattern[locationName]))].filter((value) => value && !value.startsWith("Map"))
}

export function getPinTypes(pinValues: string[]) {
    return [...new Set(pinValues.map((value) => value.split(" - ")[0]))].filter((value) => value && !value.startsWith("Map"))
}

export function getMajorBaseTypes(pinValues: string[]) {
    return [...new Set(pinValues.map((value) => majorBaseMarkTable[value]))].filter((value) => value && !value.startsWith("Map"))
}

