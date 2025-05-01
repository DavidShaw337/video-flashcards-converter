import { Flashcard } from "../interfaces"
import { formatAnkiFurigana } from "./furigana-utils"

const makeManualPrompt = (flashcards: Flashcard[], index: number) => {
    return `Look at the following Japanese subtitles.\n` +
        `Only use the previous and next subtitles as context.\n` +
        (index > 0 ? `Previous Subtitle (do not include in notes): ${flashcards[index - 1].source}\n` : ``) +
        `Source Subtitle: ${flashcards[index].source}\n` +
        (index < flashcards.length - 1 ? `Next Subtitle (do not include in notes): ${flashcards[index + 1].source}\n` : ``) +
        `Add furigana after every Kanji character in the source subtitle. e.g. 世界[せかい] ` +
        `If there are multiple possible readings and it isn't clear from context, use the more common one.\n` +
        `Translate the source subtitle into English.\n` +
        `Give 1-3 short notes explaining any uncommon words or words used in uncommon ways in the source subtitle. Do not give notes about words in the previous or next subtitles! ` +
        `Focus on any words with connotations beyond their dictionary definition, or words with multiple possible meanings, or uncommon word choice. ` +
        `Keep each note very short. ` +
        `Don't put any numbers or bullet points before each note.\n` +
        `Respond in this exact format.\n` +
        `source: \n` +
        `furigana: \n` +
        `translation: \n` +
        `notes:`
}
const parseResponse = (response: string) => {
    const lines = response.split('\n')

    let source = ''
    let furigana = ''
    let translation = ''
    let notes = ''

    let currentKey = ''

    lines.forEach(line => {
        // Trim any leading/trailing spaces
        line = line.trim()

        if (line.startsWith('source:')) {
            currentKey = 'source'
            source = line.replace('source:', '').trim()
        } else if (line.startsWith('furigana:')) {
            currentKey = 'furigana'
            furigana = line.replace('furigana:', '').trim()
        } else if (line.startsWith('translation:')) {
            currentKey = 'translation'
            translation = line.replace('translation:', '').trim()
        } else if (line.startsWith('notes:')) {
            currentKey = 'notes'
            notes = line.replace('notes:', '').trim()
        } else if (line && currentKey) {
            // Append line to the corresponding section if it’s a continuation of a multi-line value
            if (currentKey === 'source') {
                source += `\n${line}`
            } else if (currentKey === 'furigana') {
                furigana += `\n${line}`
            } else if (currentKey === 'translation') {
                translation += `\n${line}`
            } else if (currentKey === 'notes') {
                notes += `\n${line}`
            }
        }
    })

    return {
        source: source.trim(),
        furigana: formatAnkiFurigana(furigana.trim()),
        translation: translation.trim(),
        notes: notes.trim()
    }
}

export { makeManualPrompt, parseResponse }

