import type { FunctionComponent } from "react"
import { useEffect, useRef, useState } from "react"
import type { Flashcard } from "~/interfaces"
import AudioTrimmer from "./audio-trimmer"
import ManualAIModal from "./manual-ai-modal"

interface CardProps {
    video: File
    flashcards: Flashcard[]
    flashcardIndex: number
    startOffset: React.RefObject<number>
    endOffset: React.RefObject<number>
    setFlashcard: (flashcard: Flashcard) => void
}

const FocusedCard: FunctionComponent<CardProps> = ({ video, flashcards, flashcardIndex, startOffset, endOffset, setFlashcard }) => {
    const flashcard = flashcards[flashcardIndex]
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [cachedStartOffset] = useState(startOffset.current)
    const [cachedEndOffset] = useState(endOffset.current)
    const [isModalOpen, setIsModalOpen] = useState(false)

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

    const handleImageTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(event.target.value)
        setFlashcard({ ...flashcard, selectedImageTime: time })
    }

    // Handle the change for source, furigana, and translation
    const handleTextChange = (field: 'source' | 'furigana' | 'translation' | 'notes', event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFlashcard({ ...flashcard, [field]: event.target.value })
    }

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
                    min={flashcard.originalStartTime + cachedStartOffset - 2}
                    max={flashcard.originalEndTime + cachedEndOffset + 2}
                    start={flashcard.selectedStartTime || (flashcard.originalStartTime + cachedStartOffset)}
                    end={flashcard.selectedEndTime || (flashcard.originalEndTime + cachedEndOffset)}
                    setStart={(start) => setFlashcard({ ...flashcard, selectedStartTime: start })}
                    setEnd={(end) => setFlashcard({ ...flashcard, selectedEndTime: end })}
                />
            </div>
            <div style={{ flex: "1 1 33%", paddingLeft: "10px" }}>
                <h3>Source</h3>
                <textarea
                    value={flashcard.source}
                    onChange={(event) => handleTextChange('source', event)}
                    placeholder="Enter source"
                    style={{ width: "100%", height: "60px", border: "1px solid black" }}
                />
                <h3>Furigana</h3>
                <textarea
                    value={flashcard.furigana}
                    onChange={(event) => handleTextChange('furigana', event)}
                    placeholder="Enter furigana"
                    style={{ width: "100%", height: "60px", border: "1px solid black" }}
                />
                <h3>Translation</h3>
                <textarea
                    value={flashcard.translation}
                    onChange={(event) => handleTextChange('translation', event)}
                    placeholder="Enter translation"
                    style={{ width: "100%", height: "60px", border: "1px solid black" }}
                />
                <h3>Notes</h3>
                <textarea
                    value={flashcard.notes}
                    onChange={(event) => handleTextChange('notes', event)}
                    placeholder="Enter notes"
                    style={{ width: "100%", height: "120px", border: "1px solid black" }}
                />
                <button onClick={() => setIsModalOpen(!isModalOpen)} style={{
                    marginTop: "10px",
                    border: "1px solid black",  // Add a black border
                    padding: "5px 10px"          // Optionally, you can adjust the padding for a better look
                }}>Ask AI Manually</button>
            </div>
            <ManualAIModal open={isModalOpen} setOpen={setIsModalOpen} flashcards={flashcards} flashcardIndex={flashcardIndex} setFlashcard={setFlashcard} />
        </div>
    )
}

export default FocusedCard