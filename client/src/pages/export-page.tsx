import { useContext } from "react"
import { Button, Card, Container } from "react-bootstrap"
import { AppContext } from "../components/app-context"
import { downloadFlashcards } from "../utils/download-utils"

const ExportPage: React.FC = () => {
    const { setPage, sourceLanguage, deckName, videoName, flashcards } = useContext(AppContext)
    return (
        <Container style={{ maxWidth: "800px" }}>
            <Card className="mt-5" style={{ minHeight: "50vh" }}>
                <Card.Header>Export</Card.Header>
                <Card.Body>
                    <Card.Text>
                        Export a CSV file and a set of images and audio files.
                    </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setPage('flashcards')}>Back</Button>
                    <Button variant="primary" onClick={() => downloadFlashcards(flashcards, deckName, videoName, sourceLanguage)}>Download</Button>
                </Card.Footer>
            </Card>
        </Container>
    )
}
export default ExportPage