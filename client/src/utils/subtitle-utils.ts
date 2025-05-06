import { Flashcard } from "../data/interfaces"
import { roundToFixed } from "./math-utils"

const convertSRTFileToFlashcards = async (srtFile: File): Promise<Flashcard[]> => {
    const flashcards: Flashcard[] = []

    const reader = new FileReader()
    const content = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = (error) => reject(error)
        reader.readAsText(srtFile)
    })
    const srtRegex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\r?\n\r?\n|\r?\n*$)/g
    let match
    while ((match = srtRegex.exec(content)) !== null) {
        const startTime = convertTimeToSeconds(match[2])
        const endTime = convertTimeToSeconds(match[3])
        const midpoint = roundToFixed((startTime + endTime) / 2, 1)
        const text = match[4].replace(/\r\n/g, '\n').trim()
        flashcards.push({
            originalStartTime: startTime,
            originalEndTime: endTime,
            originalImageTime: midpoint,
            source: text,
        } as Flashcard)
    }
    return flashcards
}

const convertTimeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':')
    const [secs, millis] = seconds.split(',')
    return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(secs) +
        Math.round(parseInt(millis) / 100) / 10//round to 1 decimal place
    )
}

export { convertSRTFileToFlashcards }

