
export function fuzzySearch(strings: string[], pattern: string) {
    const lowerPattern = pattern.toLowerCase()
    return strings.map(str => {
        const lowerStr = str.toLowerCase()
        const upperMap = Array.from(str).map(char => char === char.toUpperCase())
        const [score, matchedPositions] = fuzzyScore(lowerStr, lowerPattern, upperMap, 0, 0, [])
        return [str, score, matchedPositions] as [string, number, number[]]
    }).filter(([_, score, __]) => score > 0).sort((a, b) => b[1] - a[1])
}

function fuzzyScore(lowerStr: string, lowerPattern: string, upperMap: boolean[], offset: number, baseScore: number, matchedPositions: number[]): [number, number[]] {
    let bestScore = 0
    let bestMatchedPositions: number[] = []
    for (let i = 0; i < lowerStr.length; ++i) {
        if (lowerStr[i] === lowerPattern[0]) {
            const score = upperMap[i] ? 1 : (lowerStr.length - i) / lowerStr.length
            const [tempScore, tempPositions] = lowerPattern.length == 1 ?
                [baseScore + score, [...matchedPositions, offset + i]] :
                fuzzyScore(lowerStr.substring(i + 1), lowerPattern.substring(1), upperMap, offset + i + 1, baseScore + score, [...matchedPositions, offset + i])
            if (tempScore > bestScore) {
                bestScore = tempScore
                bestMatchedPositions = tempPositions
            }
        }
    }
    return [bestScore, bestMatchedPositions]
}