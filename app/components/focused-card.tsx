import { useEffect, useRef, useState } from "react"
import type { FunctionComponent } from "react"
import type { Flashcard } from "~/interfaces"

interface CardProps {
    video: File
    flashcard: Flashcard
    setFlashcard: (flashcard: Flashcard) => void
}

const FocusedCard: FunctionComponent<CardProps> = ({ video, flashcard, setFlashcard }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(event.target.value)
        setFlashcard({ ...flashcard, selectedImageTime: time })
    }

    useEffect(() => {
        const videoElement = videoRef.current
        const canvasElement = canvasRef.current
        if (videoElement && canvasElement) {
            videoElement.currentTime = flashcard.selectedImageTime || flashcard.originalImageTime
            videoElement.onseeked = () => {
                const context = canvasElement.getContext("2d")
                if (context) {
                    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
                }
            }
            // Trigger the onseeked event manually
            videoElement.onseeked!(new Event('seeked'))
        }
    }, [flashcard.selectedImageTime, flashcard.originalImageTime])

    return (
        <div style={{ display: "flex", border: "1px solid black", padding: "10px", margin: "10px" }}>
            <div style={{ flex: "1 1 33%" }}>
                <canvas ref={canvasRef} width="320" height="180" style={{ width: "100%" }} />
                <video ref={videoRef} src={URL.createObjectURL(video)} style={{ display: "none" }} />
            </div>
            <div style={{ flex: "2 1 67%", paddingLeft: "10px" }}>
                <input
                    type="range"
                    min={flashcard.originalStartTime}
                    max={flashcard.originalEndTime}
                    step="0.1"
                    value={flashcard.selectedImageTime || flashcard.originalImageTime}
                    onChange={handleSliderChange}
                />
                <span>{(flashcard.selectedImageTime || flashcard.originalImageTime).toFixed(1)}s</span>
                <p>{flashcard.source}</p>
                <p>{flashcard.target}</p>
            </div>
        </div>
    )
}

export default FocusedCard