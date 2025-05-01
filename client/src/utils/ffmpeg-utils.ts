import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"
const ffmpeg = createFFmpeg({ log: false })

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
    if (latestExtractAudioStarted > started) return {}
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
        const audioFile = new Blob([data.buffer], { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioFile)
        let duration = (Date.now() - startTime) / 1000
        console.log(`[DEBUG] audioUrl: ${(data.length / (1024 * 1024)).toFixed(2)} MB, Time: ${duration.toFixed(2)}s`)

        // Decode the MP3 data into an AudioBuffer and extract the channel data
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(data.buffer)

        return { audioFile, audioUrl, audioBuffer }
    } finally {
        extractAudioRunning = false
    }
}

const extractImage = async (time: number) => {
    // Load FFmpeg
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
    }
    // Extract the screenshot at the given time
    await ffmpeg.run(
        '-i', "input.mp4",
        '-ss', time.toString(),
        '-vframes', '1',
        '-q:v', '10',  // Lower quality (higher value = lower quality)
        '-s', '640x360', // Reduce resolution (you can adjust this size as needed)
        'output.png'
    )
    // Read the screenshot file from FFmpeg virtual filesystem
    const image = ffmpeg.FS('readFile', 'output.png')
    const imageBlob = new Blob([image.buffer], { type: 'image/png' })
    return imageBlob
};

export { extractAudio, extractImage, setVideo }

