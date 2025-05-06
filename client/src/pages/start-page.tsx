import { useContext } from "react"
import { Button, Card, Container } from "react-bootstrap"
import { AppContext } from "../components/app-context"

const StartPage: React.FC = () => {
    const { setPage } = useContext(AppContext)
    return (
        <Container style={{ maxWidth: "800px" }}>
            <Card className="mt-5" style={{ minHeight: "50vh" }}>
                <Card.Header>Video Flashcards Converter</Card.Header>
                <Card.Body>
                    <Card.Text>
                        This is a tool that allows you to make foreign language flashcards from videos, movies, or TV shows.
                        <br /><br />
                        All you need is a copy of the video with audio in the original language and a subtitle file in the original language.
                        <br /><br />
                        AI will translate the subtitles into your target language.
                        <br /><br />
                        The flashcards produced are compatible with Anki, a popular flashcard app.
                    </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between">
                    <Button variant="info">Demo</Button>
                    <Button variant="primary" onClick={() => setPage('video')}>Start</Button>
                </Card.Footer>
            </Card>
        </Container>
    )
}
export default StartPage