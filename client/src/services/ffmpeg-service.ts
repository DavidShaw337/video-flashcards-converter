import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Lock } from "../utils/lock";


class FFmpegService {
    private ffmpeg = new FFmpeg()
    private video?: File
    private lock = new Lock()
    private commands = 0
    private load = async () => {
        // const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
        // ffmpeg.on("log", ({ message }) => console.log(`[FFmpeg] ${message}`))
        // toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
        await this.ffmpeg.load({
            // coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            // wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
        })
        console.log("[DEBUG] FFmpeg loaded")
    }

    setVideo = async (video: File) => {
        await this.lock.runExclusive(async () => {
            if (!this.ffmpeg.loaded) await this.load()
            this.video = video
            await this.ffmpeg.writeFile("input.mp4", await fetchFile(this.video))
            console.log("[DEBUG] Video set")
        })
    }

    private reload = async () => {
        console.log("Reloading FFmpeg")
        this.ffmpeg.terminate()
        await this.ffmpeg.load()
        await this.ffmpeg.writeFile("input.mp4", await fetchFile(this.video))
        this.commands = 0
    }

    extractAudio = async (min: number, max: number) => {
        return await this.lock.runExclusive(async () => {
            //preemptively reload
            if (this.commands > 50) await this.reload()
            //try once, and reload if it fails the first time
            try {
                return await this.tryExtractAudio(min, max)
            } catch (e) {
                await this.reload()
                return await this.tryExtractAudio(min, max)
            }
        })
    }

    private tryExtractAudio = async (min: number, max: number) => {
        let startTime = Date.now()
        if (this.video == null) throw Error("Video is not set")
        if (!this.ffmpeg.loaded) await this.load()
        await this.ffmpeg.exec([
            "-ss",
            min.toString(),
            "-t",
            (max - min).toString(),
            "-i",
            "input.mp4",
            // Set audio quality to 9 (lowest quality, smallest file size)
            "-q:a",
            "9",
            "output.mp3"]
        )
        this.commands++
        const data = await this.ffmpeg.readFile("output.mp3") as Uint8Array
        const audioBlob = new Blob([data.buffer], { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const size = data.length / (1024 * 1024)
        const duration = (Date.now() - startTime) / 1000
        console.log(`[DEBUG] extracting audio: ${size.toFixed(2)}MB, Time: ${duration.toFixed(2)}s`)
        // Decode the MP3 data into an AudioBuffer and extract the channel data
        const audioContext = new AudioContext()
        const audioBuffer = await audioContext.decodeAudioData(data.buffer)
        return { audioBlob, audioUrl, audioBuffer }
    }

    extractImage = async (time: number) => {
        return await this.lock.runExclusive(async () => {
            //preemptively reload
            if (this.commands > 50) await this.reload()
            //try once, and reload if it fails the first time
            try {
                return await this.tryExtractImage(time)
            } catch (e) {
                await this.reload()
                return await this.tryExtractImage(time)
            }
        })
    }

    private tryExtractImage = async (time: number) => {
        let startTime = Date.now()
        if (this.video == null) throw Error("Video is not set")
        if (!this.ffmpeg.loaded) await this.load()
        // Extract the screenshot at the given time
        await this.ffmpeg.exec([
            '-ss', time.toString(),
            '-i', "input.mp4",
            '-vframes', '1',
            '-q:v', '10',  // Lower quality (higher value = lower quality)
            '-s', '640x360', // Reduce resolution (you can adjust this size as needed)
            'output.png'
        ])
        this.commands++
        // Read the screenshot file from FFmpeg virtual filesystem
        const data = await this.ffmpeg.readFile('output.png') as Uint8Array
        // await ffmpeg.deleteFile('output.png')
        const imageBlob = new Blob([data.buffer], { type: 'image/png' })
        let duration = (Date.now() - startTime) / 1000
        console.log(`[DEBUG] extracting image: ${(data.length / (1024 * 1024)).toFixed(2)} MB, ${duration.toFixed(2)}s`)
        return imageBlob
    }
}

const ffmpegService = new FFmpegService()
export { ffmpegService };

