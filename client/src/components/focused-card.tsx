import type { FunctionComponent } from "react"
import { useEffect, useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { Flashcard } from "../data/interfaces"
import useFuriganaQuery from "../hooks/useFuriganaQuery"
import useNotesQuery from "../hooks/useNotesQuery"
import useTranslationQuery from "../hooks/useTranslationQuery"
import { getAverageOffsets } from "../utils/flashcard-utils"
import AudioTrimmer from "./audio-trimmer"
import ManualAIModal from "./manual-ai-modal"
import ScreenshotSelector from "./screenshot-selector"

interface CardProps {
    video: File
    flashcards: Flashcard[]
    flashcardIndex: number
    startOffset: React.RefObject<number>
    endOffset: React.RefObject<number>
    imageOffset: React.RefObject<number>
    setFlashcard: (flashcard: Flashcard) => void
}

const FocusedCard: FunctionComponent<CardProps> = ({ video, flashcards, flashcardIndex, setFlashcard }) => {
    const flashcard = flashcards[flashcardIndex]
    const [averageOffsets] = useState(() => getAverageOffsets(flashcards))
    const furiganaQuery = useFuriganaQuery()
    const translationQuery = useTranslationQuery()
    const notesQuery = useNotesQuery()
    const [isModalOpen, setIsModalOpen] = useState(false)
    //when first seeing a card, adjust the times based on the average offsets the user has set for the other cards
    useEffect(() => {
        if (!flashcard.selectedStartTime || !flashcard.selectedEndTime || !flashcard.selectedImageTime) {
            setFlashcard({
                ...flashcard,
                selectedStartTime: flashcard.selectedStartTime || Math.round((flashcard.originalStartTime + averageOffsets.startOffset) * 10) / 10,
                selectedEndTime: flashcard.selectedEndTime || Math.round((flashcard.originalEndTime + averageOffsets.endOffset) * 10) / 10,
                selectedImageTime: flashcard.selectedImageTime || Math.round((flashcard.originalImageTime + averageOffsets.imageOffset) * 10) / 10,
            })
            //once the selected times are set, this hook will not run again for this card
        }
    }, [flashcards, flashcard, setFlashcard])
    // Handle the change for source, furigana, and translation
    const handleTextChange = (field: 'source' | 'furigana' | 'translation' | 'notes', value: string) => {
        setFlashcard({ ...flashcard, [field]: value })
    }
    //these should get set almost immediately, so just don't render anything until they are set
    if (flashcard.selectedStartTime === undefined || flashcard.selectedEndTime === undefined || flashcard.selectedImageTime === undefined) {
        return null
    }
    return (
        <div>
            <Row>
                <Col xs={12} md={6}>
                    <ScreenshotSelector
                        video={video}
                        min={flashcard.originalStartTime}
                        max={flashcard.originalEndTime}
                        time={flashcard.selectedImageTime}
                        setTime={time => setFlashcard({ ...flashcard, selectedImageTime: time, isImageTimeSetByUser: true })}
                    />
                    <AudioTrimmer
                        min={flashcard.originalStartTime + averageOffsets.startOffset - 2}
                        max={flashcard.originalEndTime + averageOffsets.endOffset + 2}
                        start={flashcard.selectedStartTime}
                        end={flashcard.selectedEndTime}
                        setStart={(start) => setFlashcard({ ...flashcard, selectedStartTime: start, isStartTimeSetByUser: true })}
                        setEnd={(end) => setFlashcard({ ...flashcard, selectedEndTime: end, isEndTimeSetByUser: true })}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <div className="mt-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3>Source</h3>
                        <Button variant="primary"
                            onClick={() => {
                                furiganaQuery.query(flashcard.source).then(furigana => {
                                    if (furigana) setFlashcard({ ...flashcard, furigana })
                                })
                                translationQuery.query(flashcard.source).then(translation => {
                                    if (translation) setFlashcard({ ...flashcard, translation })
                                })
                                notesQuery.query(flashcard.source).then(notes => {
                                    if (notes) setFlashcard({ ...flashcard, notes })
                                })
                            }}
                        >
                            Fill All
                        </Button>
                    </div>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            as="textarea"
                            value={flashcard.source}
                            onChange={(event) => handleTextChange('source', event.target.value)}
                            placeholder="Enter source"
                            style={{ height: "65px" }}
                        />
                    </Form.Group>
                    <div className="mt-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3>Furigana</h3>
                        <Button variant="primary"
                            onClick={async () => {
                                const furigana = await furiganaQuery.query(flashcard.source)
                                if (furigana) setFlashcard({ ...flashcard, furigana })
                            }}
                        >
                            Fill
                        </Button>
                    </div>
                    <Form.Control
                        type="text"
                        as="textarea"
                        value={flashcard.furigana}
                        onChange={(event) => handleTextChange('furigana', event.target.value)}
                        placeholder="Enter furigana"
                        style={{ height: "65px" }}
                    />
                    <div className="mt-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3>Translation</h3>
                        <Button variant="primary"
                            onClick={async () => {
                                const translation = await translationQuery.query(flashcard.source)
                                if (translation) setFlashcard({ ...flashcard, translation })
                            }}
                        >
                            Fill
                        </Button>
                    </div>
                    <Form.Control
                        type="text"
                        as="textarea"
                        value={flashcard.translation}
                        onChange={(event) => handleTextChange('translation', event.target.value)}
                        placeholder="Enter translation"
                        style={{ height: "65px" }}
                    />
                    <div className="mt-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3>Notes</h3>
                        <Button variant="primary"
                            onClick={async () => {
                                const notes = await notesQuery.query(flashcard.source)
                                if (notes) setFlashcard({ ...flashcard, notes })
                            }}
                        >
                            Fill
                        </Button>
                    </div>
                    <Form.Control
                        type="text"
                        as="textarea"
                        value={flashcard.notes}
                        onChange={(event) => handleTextChange('notes', event.target.value)}
                        placeholder="Enter notes"
                        style={{ height: "130px" }}
                    />
                    <Row className="mt-2">
                        <Col>
                            <Button variant="primary" onClick={() => setIsModalOpen(!isModalOpen)} >Ask AI Manually</Button>
                        </Col>
                        <Col>
                            <Button variant="danger" onClick={() => setFlashcard({ ...flashcard, isDeleted: true })}>Delete</Button>
                        </Col>
                    </Row>
                </Col>
                <ManualAIModal open={isModalOpen} setOpen={setIsModalOpen} flashcards={flashcards} flashcardIndex={flashcardIndex} setFlashcard={setFlashcard} />
            </Row>
        </div>
    )
}

export default FocusedCard