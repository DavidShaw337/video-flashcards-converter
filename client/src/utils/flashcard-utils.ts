import { Flashcard } from "../data/interfaces";


const getAverageOffsets = (flashcards: Flashcard[]) => {
    let startOffset = 0
    let startCount = 0
    let endOffset = 0
    let endCount = 0
    let imageOffset = 0
    let imageCount = 0
    //add up and count all the offsets actually set by the user
    for (const flashcard of flashcards) {
        if (flashcard.isStartTimeSetByUser && flashcard.selectedStartTime !== undefined) {
            startOffset += flashcard.selectedStartTime - flashcard.originalStartTime
            startCount++
        }
        if (flashcard.isEndTimeSetByUser && flashcard.selectedEndTime !== undefined) {
            endOffset += flashcard.selectedEndTime - flashcard.originalEndTime
            endCount++
        }
        if (flashcard.isImageTimeSetByUser && flashcard.selectedImageTime !== undefined) {
            imageOffset += flashcard.selectedImageTime - flashcard.originalImageTime
            imageCount++
        }
    }
    //divide by the number of offsets to get the average
    if (startCount > 0) {
        startOffset = startOffset / startCount
    }
    if (endCount > 0) {
        endOffset = endOffset / endCount
    }
    if (imageCount > 0) {
        imageOffset = imageOffset / imageCount
    }
    return { startOffset, endOffset, imageOffset }
}

export { getAverageOffsets };
