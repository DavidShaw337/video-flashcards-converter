import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useRef, useState } from "react";
import { Form } from "react-bootstrap";


const ffmpeg = new FFmpeg()

const TestPage = () => {
    const [loaded, setLoaded] = useState(false)
    const messageRef = useRef<HTMLParagraphElement | null>(null)

    const load = async () => {
        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
        ffmpeg.on("log", ({ message }) => {
            if (messageRef.current) messageRef.current.innerHTML = message;
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.wasm`,
                "application/wasm"
            ),
            workerURL: await toBlobURL(
                `${baseURL}/ffmpeg-core.worker.js`,
                "text/javascript"
            ),
        });
        setLoaded(true);
    };
    const setVideo = async (video: File) => {
        console.log("[DEBUG] Setting video")
        await ffmpeg.writeFile("input.mp4", await fetchFile(video))
        await ffmpeg.exec([
            "-i",
            "input.mp4",
            "-ss",
            "1",
            "-to",
            "10",
            // Set audio quality to 9 (lowest quality, smallest file size)
            "-q:a",
            "9",
            "output.mp3"]
        )
        const data = await ffmpeg.readFile("output.mp3")
        const audioFile = new Blob([data as ArrayBuffer], { type: "audio/mp3" })
        // const audioUrl = URL.createObjectURL(audioFile)
        // Trigger the download
        const url = window.URL.createObjectURL(audioFile)
        const a = document.createElement('a')
        a.href = url
        a.download = `out.mp3`
        document.body.appendChild(a)
        a.click()
        a.remove()
    }
    return loaded ? (
        <div>
            <h1>Test Page</h1>
            <p>This is a test page.</p>
            <Form.Control
                type="file"
                accept="video/*"
                onChange={event => {
                    const target = event.target as HTMLInputElement
                    if (target.files && target.files.length > 0) {
                        setVideo(target.files[0])
                    }
                }}
            />
        </div>
    ) : (
        <button onClick={load}>Load ffmpeg-core</button>
    );
}

export default TestPage