import type { FunctionComponent } from "react"
import { useEffect, useRef } from "react"
import type { Flashcard } from "~/interfaces"
import AudioTrimmer from "./audio-trimmer"

interface CardProps {
    video: File
    audio: string
    audioBuffer: AudioBuffer
    flashcard: Flashcard
    setFlashcard: (flashcard: Flashcard) => void
}

const FocusedCard: FunctionComponent<CardProps> = ({ video, audio, audioBuffer, flashcard, setFlashcard }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const handleImageTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(event.target.value)
        setFlashcard({ ...flashcard, selectedImageTime: time })
    }

    useEffect(() => {
        const videoElement = videoRef.current
        const canvasElement = canvasRef.current
        if (videoElement && canvasElement) {
            const handleLoadedMetadata = async () => {
                videoElement.currentTime = flashcard.selectedImageTime || flashcard.originalImageTime
                videoElement.onseeked = async () => {
                    const context = canvasElement.getContext("2d")
                    if (context) {
                        context.clearRect(0, 0, 0, 0)
                        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
                        await new Promise(resolve => setTimeout(resolve, 1))
                        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
                    }
                }
                // Trigger the onseeked event manually
                videoElement.onseeked!(new Event('seeked'))
            }
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
            return () => {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
            }
        }
    }, [flashcard.selectedImageTime, flashcard.originalImageTime])

    return (
        <div style={{ display: "flex", border: "1px solid black", padding: "10px", margin: "10px" }}>
            <div style={{ flex: "1 1 33%" }}>
                <canvas ref={canvasRef} width="320" height="180" style={{ width: "100%" }} />
                <video ref={videoRef} src={URL.createObjectURL(video)} style={{ display: "none" }} />
            </div>
            <div style={{ flex: "2 1 33%", paddingLeft: "10px" }}>
                <h3>Image</h3>
                <input
                    type="range"
                    min={flashcard.originalStartTime}
                    max={flashcard.originalEndTime}
                    step="0.1"
                    value={flashcard.selectedImageTime || flashcard.originalImageTime}
                    onChange={handleImageTimeChange}
                />
                <span>{(flashcard.selectedImageTime || flashcard.originalImageTime).toFixed(1)}s</span>
                <br />
                <h3>Audio</h3>
                <AudioTrimmer
                    audioUrl={audio}
                    audioBuffer={audioBuffer}
                    min={flashcard.originalStartTime - 5}
                    max={flashcard.originalEndTime + 5}
                    start={flashcard.selectedStartTime || flashcard.originalStartTime}
                    end={flashcard.selectedEndTime || flashcard.originalEndTime}
                    setStart={(start) => setFlashcard({ ...flashcard, selectedStartTime: start })}
                    setEnd={(end) => setFlashcard({ ...flashcard, selectedEndTime: end })}
                />
                {/* <input
                    type="range"
                    min={flashcard.originalStartTime - 3}
                    max={flashcard.originalStartTime + 3}
                    step="0.1"
                    value={flashcard.selectedStartTime || flashcard.originalStartTime}
                    onChange={handleStartTimeChange}
                />
                <span>{(flashcard.selectedStartTime || flashcard.originalStartTime).toFixed(1)}s</span>
                <br />
                <input
                    type="range"
                    min={flashcard.originalEndTime - 3}
                    max={flashcard.originalEndTime + 3}
                    step="0.1"
                    value={flashcard.selectedEndTime || flashcard.originalEndTime}
                    onChange={handleEndTimeChange}
                />
                <span>{(flashcard.selectedEndTime || flashcard.originalEndTime).toFixed(1)}s</span>
                <br /> */}
                {/* {audio && <audio ref={audioRef} controls src={audio} />} */}
                {/* <canvas ref={visualizerCanvasRef} width="320" height="100" style={{ width: "100%", marginTop: "10px" }} /> */}
            </div>
            <div style={{ flex: "1 1 33%", paddingLeft: "10px" }}>
                <p>{flashcard.source}</p>
                <p>{flashcard.target}</p>
            </div>
        </div>
    )
}

export default FocusedCard