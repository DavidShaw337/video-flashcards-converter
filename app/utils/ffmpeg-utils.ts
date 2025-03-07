import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"

const extractAudio = async (video: File) => {
    let startTime = Date.now()
    const ffmpeg = createFFmpeg({ log: true })
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load()
    }
    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video))


    await ffmpeg.run(
        "-i",
        "input.mp4",
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
    startTime = Date.now()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(data.buffer)
    duration = (Date.now() - startTime) / 1000
    console.log(`[DEBUG] audioBuffer: ${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB, Time: ${duration.toFixed(2)}s`)

    return { audioUrl, audioBuffer }
}

export { extractAudio }

