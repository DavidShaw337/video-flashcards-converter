import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
const ffmpeg = createFFmpeg({ log: true })

const setVideo = async (video: File) => {
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
    }

    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video))
}

let extractAudioRunning = false
let latestExtractAudioStarted: string | null = null
const extractAudio = async (min: number, max: number) => {
    const started = new Date().toISOString()
    latestExtractAudioStarted = started
    while (extractAudioRunning) {
        await new Promise(resolve => setTimeout(resolve, 100)) // Wait for 100ms before checking again
    }
    if (latestExtractAudioStarted > started) return { audioUrl:null, audioBuffer:null}
    extractAudioRunning = true

    let startTime = Date.now()
    try {
        if (!ffmpeg.isLoaded()) {
            await ffmpeg.load()
        }

        if (!ffmpeg.FS("readdir", "/").includes("input.mp4")) {
            throw Error("Input video not set")
        }

        await ffmpeg.run(
            "-i",
            "input.mp4",
            "-ss",
            min.toString(),
            "-to",
            max.toString(),
            // Set audio quality to 9 (lowest quality, smallest file size)
            "-q:a",
            "9",
            "output.mp3"
        )

        const data = ffmpeg.FS("readFile", "output.mp3")
        const audioUrl = URL.createObjectURL(new Blob([data.buffer], { type: "audio/mp3" }))
        let duration = (Date.now() - startTime) / 1000
        console.log(`[DEBUG] audioUrl: ${(data.length / (1024 * 1024)).toFixed(2)} MB, Time: ${duration.toFixed(2)}s`)

        // Decode the MP3 data into an AudioBuffer and extract the channel data
        // startTime = Date.now()
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(data.buffer)
        // duration = (Date.now() - startTime) / 1000
        // console.log(`[DEBUG] audioBuffer: ${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB, Time: ${duration.toFixed(2)}s`)

        return { audioUrl, audioBuffer }
    } finally {
        extractAudioRunning = false
    }
}

export { extractAudio, setVideo }

