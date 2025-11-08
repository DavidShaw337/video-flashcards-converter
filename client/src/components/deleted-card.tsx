import type { FunctionComponent } from "react"
import { Button, Col, Row } from "react-bootstrap"
import { Flashcard } from "../data/interfaces"

interface CardProps {
    flashcard: Flashcard
    setFlashcard: (flashcard: Flashcard) => void
}

const DeletedCard: FunctionComponent<CardProps> = ({ flashcard, setFlashcard }) => {
    return (
        <Row>
            <Col xs={1}>
                <Button variant="outline-primary" size="sm" onClick={() => setFlashcard({ ...flashcard, isDeleted: false })}>
                    Undelete
                </Button>
            </Col>
            <Col xs={5}>{flashcard.source}</Col>
            {/* <Col xs={6}>{flashcard.translation}</Col> */}
        </Row>
    )
}

export default DeletedCard