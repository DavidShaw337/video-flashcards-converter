import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg()
const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
    // ffmpeg.on("log", ({ message }) => console.log(`[FFmpeg] ${message}`))
    // toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    })
    console.log("[DEBUG] FFmpeg loaded")
}

const setVideo = async (video: File) => {
    if (!ffmpeg.loaded) await load()
    await ffmpeg.writeFile("input.mp4", await fetchFile(video))
    console.log("[DEBUG] Video set")
}

let extractAudioRunning = false
let latestExtractAudioStarted: string | null = null
const extractAudio = async (min: number, max: number) => {
    if (!ffmpeg.loaded) await load()
    const started = new Date().toISOString()
    latestExtractAudioStarted = started
    while (extractAudioRunning) {
        await new Promise(resolve => setTimeout(resolve, 100)) // Wait for 100ms before checking again
    }
    if (latestExtractAudioStarted > started) return {}
    extractAudioRunning = true

    let startTime = Date.now()
    try {
        if (!(await ffmpeg.listDir("/")).some(file => file.name === "input.mp4")) {
            throw Error("Input video not set")
        }

        await ffmpeg.exec([
            "-i",
            "input.mp4",
            "-ss",
            min.toString(),
            "-to",
            max.toString(),
            // Set audio quality to 9 (lowest quality, smallest file size)
            "-q:a",
            "9",
            "output.mp3"]
        )

        const data = await ffmpeg.readFile("output.mp3") as Uint8Array
        const audioFile = new Blob([data.buffer], { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioFile)
        let duration = (Date.now() - startTime) / 1000
        console.log(`[DEBUG] extracting audio: ${(data.length / (1024 * 1024)).toFixed(2)} MB, Time: ${duration.toFixed(2)}s`)

        // Decode the MP3 data into an AudioBuffer and extract the channel data
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(data.buffer)

        return { audioFile, audioUrl, audioBuffer }
    } finally {
        extractAudioRunning = false
    }
}

const extractImage = async (time: number) => {
    if (!ffmpeg.loaded) await load()
    let startTime = Date.now()
    if (!(await ffmpeg.listDir("/")).some(file => file.name === "input.mp4")) {
        throw Error("Input video not set")
    }
    // Extract the screenshot at the given time
    await ffmpeg.exec([
        '-i', "input.mp4",
        '-ss', time.toString(),
        '-vframes', '1',
        '-q:v', '10',  // Lower quality (higher value = lower quality)
        '-s', '640x360', // Reduce resolution (you can adjust this size as needed)
        'output.png'
    ])
    // Read the screenshot file from FFmpeg virtual filesystem
    const data = await ffmpeg.readFile('output.png') as Uint8Array
    // await ffmpeg.deleteFile('output.png')
    const imageBlob = new Blob([data.buffer], { type: 'image/png' })
    let duration = (Date.now() - startTime) / 1000
    console.log(`[DEBUG] extracting image: ${(data.length / (1024 * 1024)).toFixed(2)} MB, ${duration.toFixed(2)}s`)
    return imageBlob
};

export { extractAudio, extractImage, setVideo };

