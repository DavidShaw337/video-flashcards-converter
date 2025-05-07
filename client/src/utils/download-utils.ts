import JSZip from "jszip"
import { Flashcard } from "../data/interfaces"
import { extractAudio, extractImage } from "./ffmpeg-utils"

const downloadFlashcards = async (flashcards: Flashcard[], deckName: string, videoName: string, sourceLanguage: string) => {
    flashcards = flashcards.slice(0, 100)
    //
    const zip = new JSZip()
    //
    let csvContent = "#separator:Semicolon\n"
    csvContent += `#notetype:${deckName} Subtitle\n`
    if (sourceLanguage === "ja") {
        //TODO add a column for Romaji
        csvContent += "#columns:Id;Image;Audio;Source;Furigana;Translation;Notes\n"
    } else {
        csvContent += "#columns:Id;Image;Audio;Source;Translation;Notes\n"
    }
    //
    for (let i = 0; i < flashcards.length; i++) {
        console.log(`[DEBUG] Processing flashcard ${i + 1} of ${flashcards.length}`)
        const flashcard = flashcards[i]
        if (flashcard.isDeleted) {
            console.log(`[DEBUG] Skipping deleted flashcard ${i + 1}`)
            continue
        }
        const time = flashcard.originalStartTime.toFixed(2).padStart(8, '0')
        //
        const imageName = `${deckName}_${videoName}_${time.replace(".", "")}.png`
        const imageBlob = await extractImage(flashcard.selectedImageTime || flashcard.originalImageTime)
        zip.file(imageName, imageBlob)
        //
        const audioName = `${deckName}_${videoName}_${time.replace(".", "")}.mp3`
        const { audioFile } = await extractAudio(flashcard.selectedStartTime || flashcard.originalStartTime, flashcard.selectedEndTime || flashcard.originalEndTime)
        zip.file(audioName, audioFile!)
        //
        csvContent += `${videoName}_${time};`
        csvContent += `<img src="${imageName}">;`
        csvContent += `[sound:${audioName}];`
        csvContent += `"${flashcard.source.replace(/"/g, '""')}";`
        if (sourceLanguage === "ja") {
            csvContent += `"${(flashcard.furigana || "").replace(/"/g, '""')}";`
        }
        csvContent += `"${(flashcard.translation || "").replace(/"/g, '""')}";`
        csvContent += `"${(flashcard.notes || "").replace(/"/g, '""')}"\n`
    }
    //
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    zip.file('import.csv', csvBlob)
    // Add Anki instructions
    const instructions = getAnkiInstructions(deckName, sourceLanguage)
    zip.file('Anki Instructions.txt', instructions)
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    // Trigger the download
    const url = window.URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${deckName}_${videoName}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
}

const getAnkiInstructions = (deckName: string, sourceLanguage: string) => {
    const instructions = `The goal is to make 2 decks: one for reading and one for listening.` +
        `We also create 1 note type that automatically makes a card in each deck for each note added.` +
        `You can make these 2 decks and 1 note type for each video, or each series, or each language, etc.\n` +
        `\n` +
        `Warning: Making a new note type will require you to overwrite your collection in AnkiWeb. ` +
        `So make sure you're fully synced with AnkiWeb before, then follow these instructions, ` +
        `then sync your changes to AnkiWeb, then sync AnkiWeb with any other instance of Anki (like your phone).\n` +
        `\n` +
        `Step 1: Make 2 Decks, 1 Note Type, and 2 Card Types\n` +
        `1. Create Deck > Enter "${deckName}::Reading" > Select OK\n` +
        `2. Create Deck > Enter "${deckName}::Listening" > Select OK\n` +
        `3. Tools > Manage Note Types > Add > Add: Basic > OK > "${deckName} Subtitle" > OK\n` +
        `4. Select "${deckName} Subtitle" from the list > Select Fields\n` +
        `5. Replace the default fields with new ones: Id, Image, Audio, Source, ${sourceLanguage === "ja" ? `Furigana` : ``}, Translation, and Notes\n` +
        `6. Select "Id" > Check "Sort by this field in the browser"\n` +
        `7. Save\n` +
        `8. Select "${deckName} Subtitle" from the list > Select "Cards"\n` +
        `9. Options > Rename Card Type > "Listening" > OK\n` +
        `10. Options > Deck Override > "${deckName}::Listening" > Close\n` +
        `11. Change Front Template:\n` +
        `{{Image}}\n` +
        `<br/>\n` +
        (sourceLanguage === "ja" ? `<div class=rubypopup>{{furigana:Furigana}}</div>\n<br/>\n` : ``) +
        `{{Audio}}\n` +
        `12. Change Back Template:\n` +
        `{{FrontSide}}\n` +
        `<hr id=answer>\n` +
        (sourceLanguage === "ja" ? `{{furigana:Furigana}}\n<br/><br/>\n` : `{{Source}}\n<br/><br/>\n`) +
        `{{Translation}}` +
        `<br/><br/>\n` +
        `{{Notes}}\n` +
        `13. Change Styling:\n` +
        `.card {\n` +
        `    font-family: arial;\n` +
        `    font-size: 20px;\n` +
        `    text-align: center;\n` +
        `    color: black;\n` +
        `    background-color: white;\n` +
        `}\n` +
        (sourceLanguage === "ja" ? `.rubypopup ruby rt { visibility: hidden; }\n` +
            `.rubypopup ruby:active rt { visibility: visible; }\n` +
            `.rubypopup ruby:hover rt { visibility: visible; }\n` : ``) +
        `14. Save\n` +
        `15. Select "${deckName} Subtitle" from the list > Select "Cards"\n` +
        `16. Options > Add Card Type\n` +
        `17. Options > Rename Card Type > "Reading" > OK\n` +
        `18. Options > Deck Override > "${deckName}::Reading"\n` +
        `19. Change Front Template:\n` +
        `{{Image}}\n` +
        `<br/>\n` +
        `{{Source}}\n` +
        `20. Change Back Template:\n` +
        `{{FrontSide}}\n` +
        `<hr id=answer>\n` +
        (sourceLanguage === "ja" ? `{{furigana:Furigana}}\n<br/><br/>\n` : ``) +
        `{{Translation}}\n` +
        `<br/><br/>\n` +
        `{{Notes}}\n` +
        `<br/><br/>\n` +
        `{{Audio}}\n` +
        `22. Save\n` +
        `\n` +
        `Optional Step: Make ${deckName} Image note type\n` +
        `1. Tools > Manage Note Types > Add > Add: Basic > OK > "${deckName} Image" > OK\n` +
        `2. Select "${deckName} Image" from the list > Select Fields\n` +
        `3. Replace the default fields with new ones: Id, Image, Source, ${sourceLanguage === "ja" ? `Furigana` : ``}, Translation, and Notes\n` +
        `4. Select "Id" > Check "Sort by this field in the browser"\n` +
        `5. Save\n` +
        `6. Select "${deckName} Image" from the list > Select "Cards"\n` +
        `7. Options > Rename Card Type > "Reading" > OK\n` +
        `8. Options > Deck Override > "${deckName}::Reading" > Close\n` +
        `9. Change Front Template:\n` +
        `{{Image}}\n` +
        `<br/>\n` +
        `{{Source}}\n` +
        `10. Change Back Template:\n` +
        `{{FrontSide}}\n` +
        `<hr id=answer>\n` +
        (sourceLanguage === "ja" ? `{{furigana:Furigana}}\n<br/><br/>\n` : ``) +
        `{{Translation}}\n` +
        `<br/><br/>\n` +
        `{{Notes}}\n` +
        `11. Save` +
        `\n` +
        `Step 2: Import into Anki\n` +
        `1. Open the collection.media folder at Tools > Check Media > View Files\n` +
        `2. Drag the images and audio files into the folder (not the csv or txt files)\n` +
        `3. Drag import.csv somewhere outside the zip folder\n` +
        `4. Select "Import File" and select import.csv\n` +
        `5. Make sure everything is correct and select "Import"`
    return instructions
}

export { downloadFlashcards }

