function formatAnkiFurigana(input: string): string {
    // Regular expression to find a sequence of Kanji characters followed by an opening bracket '['
    const regex = /(.?[\p{Script=Han}]+\[)/gu
    // Replace occurrences by adding a space before the kanji only if there's no space or ']' before the match
    let furigana = input.replace(regex, (match, kanjiGroup: string) => {
        console.log("Matched kanji group:", kanjiGroup)
        const firstChar = kanjiGroup[0]
        //if the first character is a space, Anki will treat that as a break for the furigana
        if (firstChar === ' ') return kanjiGroup
        //if the first character is a closing bracket, Anki will treat that as a break for the furigana
        if (firstChar === ']') return kanjiGroup
        //if the first character is a kanji, this must be the start of the string
        if (/\p{Script=Han}/u.test(firstChar)) return kanjiGroup
        //otherwise, Anki needs a space before the kanji to keep the furigana over the right characters
        return firstChar + ' ' + kanjiGroup.slice(1)
    })
    //
    return furigana
}

export { formatAnkiFurigana }

