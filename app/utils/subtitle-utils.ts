import type { Flashcard } from "~/interfaces";

const convertSubtitleFiles = async (sourceFile: File, targetFile: File): Promise<Flashcard[]> => {
    const sourceSubtitles = await convertSubtitleFile(sourceFile);
    const targetSubtitles = await convertSubtitleFile(targetFile);
    const flashcards: Flashcard[] = [];
    for (const sourceSubtitle of sourceSubtitles) {
        const midpoint = (sourceSubtitle.startTime + sourceSubtitle.endTime) / 2;
        flashcards.push({
            originalStartTime: sourceSubtitle.startTime,
            originalEndTime: sourceSubtitle.endTime,
            originalImageTime: midpoint,
            source: sourceSubtitle.text,
        } as Flashcard)
    }
    for (let i = 0; i < targetSubtitles.length; i++) {
        if (flashcards[i]) {
            flashcards[i].target = targetSubtitles[i].text;
        }
    }
    return flashcards;
}
const convertSubtitleFile = async (file: File): Promise<Subtitle[]> => {
    const reader = new FileReader();

    const content = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });

    const subtitles: Subtitle[] = [];
    const srtRegex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\r?\n\r?\n|\r?\n*$)/g;
    let match;

    while ((match = srtRegex.exec(content)) !== null) {
        const startTime = convertTimeToSeconds(match[2]);
        const endTime = convertTimeToSeconds(match[3]);
        const duration = endTime - startTime;
        const text = match[4].replace(/\n/g, ' ').trim();
        subtitles.push({ startTime, endTime, duration, text });
    }

    return subtitles;
};

const convertTimeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, millis] = seconds.split(',');
    return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseInt(secs) +
        parseInt(millis) / 1000
    );
};

interface Subtitle {
    startTime: number; // in seconds
    endTime: number; // in seconds
    duration: number
    text: string;
}

export { convertSubtitleFiles  };

