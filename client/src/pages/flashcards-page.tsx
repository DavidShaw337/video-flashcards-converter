import { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Container, ListGroup } from "react-bootstrap";
import { AppContext } from "../components/app-context";
import CollapsedCard from "../components/collapsed-card";
import DeletedCard from "../components/deleted-card";
import FocusedCard from "../components/focused-card";
import { Flashcard } from "../data/interfaces";
import { setVideo } from "../utils/ffmpeg-utils";

const FlashcardsPage = () => {
    const { setPage, videoFile, flashcards, setFlashcards } = useContext(AppContext)
    const startOffset = useRef(0)
    const endOffset = useRef(0)
    const imageOffset = useRef(0)
    const [focusedCard, setFocusedCard] = useState<number | null>(null)
    useEffect(() => {
        if (videoFile) {
            setVideo(videoFile)
        }
    }, [videoFile])

    const setFlashcard = (index: number, updatedFlashcard: Flashcard) => {
        setFlashcards((prevFlashcards) => {
            const newFlashcards = [...prevFlashcards]
            newFlashcards[index] = updatedFlashcard
            return newFlashcards
        })
    }
    console.log(focusedCard)
    return (
        <Container>
            <Card className="mt-5" style={{ minHeight: "50vh" }}>
                <Card.Header>Flashcards</Card.Header>
                <ListGroup>
                    {videoFile && flashcards.map((flashcard, index) => (
                        <div key={index} onClick={() => {
                            if (focusedCard !== index) setFocusedCard(index)
                        }}>
                            {flashcard.isDeleted ?
                                <ListGroup.Item>
                                    <DeletedCard
                                        flashcard={flashcard}
                                        setFlashcard={(updatedFlashcard) => setFlashcard(index, updatedFlashcard)}
                                    />
                                </ListGroup.Item> :
                                focusedCard === index ?
                                    <ListGroup.Item>
                                        <FocusedCard
                                            video={videoFile}
                                            flashcards={flashcards}
                                            flashcardIndex={index}
                                            startOffset={startOffset}
                                            endOffset={endOffset}
                                            imageOffset={imageOffset}
                                            setFlashcard={(updatedFlashcard) => setFlashcard(index, updatedFlashcard)}
                                        />
                                    </ListGroup.Item>
                                    :
                                    <ListGroup.Item>
                                        <CollapsedCard subtitle={flashcard} />
                                    </ListGroup.Item>
                            }
                        </div>
                    ))}
                </ListGroup>
                <Card.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setPage("config")}>Back</Button>
                    <Button variant="primary" onClick={() => setPage("export")}>Export</Button>
                </Card.Footer>
            </Card>
        </Container>
    )
}
export default FlashcardsPage