function formatAnkiFurigana(input: string): string {
    // Regular expression to find a sequence of Kanji characters followed by an opening bracket '['
    // Ensure there's no space or ']' before the match using a negative lookbehind
    const regex = /(?<![\s\]\p{Script=Han}^|\n])([\p{Script=Han}]+\[)/gu

    // Replace occurrences by adding a space before the kanji only if there's no space or ']' before the match
    return input.replace(regex, (match, kanjiGroup: string) => " " + kanjiGroup)
}

export { formatAnkiFurigana }

