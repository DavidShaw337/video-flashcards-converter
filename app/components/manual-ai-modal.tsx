import { useEffect, useRef, useState, type FunctionComponent } from "react"
import { FaClipboard, FaClipboardCheck } from "react-icons/fa"
import type { Flashcard } from "~/interfaces"
import { makeManualPrompt, parseResponse } from "~/utils/ai-utils"

interface IManualAIModal {
    open: boolean
    setOpen: (o: boolean) => void
    flashcards: Flashcard[]
    flashcardIndex: number
    setFlashcard: (f: Flashcard) => void
}

const ManualAIModal: FunctionComponent<IManualAIModal> = ({ open, setOpen, flashcards, flashcardIndex, setFlashcard }) => {
    const [responseText, setResponseText] = useState<string>("")
    const [copied, setCopied] = useState<boolean>(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        if (open) {
            setCopied(false)
            if (textareaRef.current) {
                textareaRef.current.value = makeManualPrompt(flashcards, flashcardIndex) // Set initial value
            }
        }
    }, [open, flashcards, flashcardIndex])
    const copyToClipboard = () => {
        if (textareaRef.current) {
            const textToCopy = textareaRef.current.value
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log("Copied to clipboard!")
                setCopied(true) // Set the copied state to true
            }).catch((err) => {
                console.error("Failed to copy text: ", err)
            })
        }
    }

    // If the modal is not open, return null
    if (!open) return null

    return (
        <div
            style={{
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    maxWidth: "800px",
                    width: "100%",
                }}
            >
                <h3>Copy this prompt into a LLM AI</h3>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <textarea
                        ref={textareaRef} // Attach ref to the textarea
                        style={{
                            border: "1px solid black",
                            padding: "5px 10px",
                            width: "100%",
                            height: "100px",
                        }}
                    />
                    <button
                        onClick={copyToClipboard}
                        style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "0 10px",
                            marginLeft: "10px",
                        }}
                    >
                        {copied ? (
                            <FaClipboardCheck size={24} />
                        ) : (
                            <FaClipboard size={24} />
                        )}
                    </button>
                </div>
                <h3>Paste the response here</h3>
                <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)} // Update state on change
                    style={{
                        border: "1px solid black",
                        padding: "5px 10px",
                        width: "100%",
                        height: "100px",
                    }}
                />
                <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
                    <button
                        onClick={() => {
                            setOpen(false)
                            setResponseText("") // Clear the response text when modal closes
                        }}
                        style={{
                            border: "1px solid black",
                            padding: "5px 10px",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            const parsedResponse = parseResponse(responseText)
                            setFlashcard({ ...flashcards[flashcardIndex], furigana: parsedResponse.furigana, translation: parsedResponse.translation, notes: parsedResponse.notes })
                            setOpen(false)
                        }}
                        style={{
                            border: "1px solid black",
                            padding: "5px 10px",
                        }}
                    >
                        Save Response
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ManualAIModal