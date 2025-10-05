export function fuzzySearch(strings: string[], pattern: string) {
    const lowerPattern = pattern.toLowerCase()
    const mostUpperCount = Math.max(...strings.map(str => Array.from(str).filter(char => isUpper(char)).length))
    const mostStringLength = Math.max(...strings.map(str => str.length))
    return strings.map(str => {
        const lowerStr = str.toLowerCase()
        const upperPositions = Array.from(str).map((char, index) => isUpper(char) ? index : -1).filter(i => i >= 0)
        const [score, matchedPositions] = fuzzyScore(lowerStr, lowerPattern, mostStringLength, upperPositions, mostUpperCount, 0, 0, [])
        return [str, score, matchedPositions] as [string, number, number[]]
    }).filter(([_, score, __]) => score > 0).sort((a, b) => b[1] - a[1])
}

function isUpper(char: string) {
    return char === char.toUpperCase() && char !== char.toLowerCase()
}

function fuzzyScore(lowerStr: string, lowerPattern: string, mostStringLength: number, upperPositions: number[], mostUpperCount: number, offset: number, baseScore: number, matchedPositions: number[]): [number, number[]] {
    let bestScore = 0
    let bestMatchedPositions: number[] = []
    for (let i = 0; i < lowerStr.length; ++i) {
        if (lowerStr[i] === lowerPattern[0]) {
            upperPositions = upperPositions.filter(index => index >= offset)
            const upperIndex = upperPositions.indexOf(offset + i)
            const score = Math.pow(upperIndex < 0 ? 1 - i / mostStringLength : 1 - upperIndex / mostUpperCount / mostStringLength, 2)
            const [tempScore, tempPositions] = lowerPattern.length == 1 ?
                [baseScore + score, [...matchedPositions, offset + i]] :
                fuzzyScore(lowerStr.substring(i + 1), lowerPattern.substring(1), mostStringLength, upperPositions, mostUpperCount, offset + i + 1, baseScore + score, [...matchedPositions, offset + i])
            if (tempScore > bestScore) {
                bestScore = tempScore
                bestMatchedPositions = tempPositions
            }
        }
    }
    return [bestScore, bestMatchedPositions]
}
