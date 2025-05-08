import { useContext, useState } from "react"
import { Button, Card, Container, ProgressBar } from "react-bootstrap"
import { AppContext } from "../components/app-context"
import { downloadFlashcards } from "../utils/download-utils"

const ExportPage: React.FC = () => {
    const { setPage, sourceLanguage, deckName, videoName, flashcards } = useContext(AppContext)
    const [progress, setProgress] = useState(0)
    return (
        <Container style={{ maxWidth: "800px" }}>
            <Card className="mt-5" style={{ minHeight: "50vh" }}>
                <Card.Header>Export</Card.Header>
                <Card.Body>
                    <Card.Text>
                        Export a CSV file and a set of images and audio files.
                    </Card.Text>
                    {progress > 0 && <ProgressBar now={progress*100} label={`${(progress*100).toFixed(0)}%`} className="mb-3" />}
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => setPage('flashcards')}>Back</Button>
                    <Button variant="primary" onClick={() => downloadFlashcards(flashcards, deckName, videoName, sourceLanguage, setProgress)}>Download</Button>
                </Card.Footer>
            </Card>
        </Container>
    )
}
export default ExportPage