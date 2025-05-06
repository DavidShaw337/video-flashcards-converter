import { useContext } from "react"
import { Button, Card, Container, Form } from "react-bootstrap"
import { AppContext } from "../components/app-context"
import LanguageSelector from "../components/language-selector"

const ConfigPage: React.FC = () => {
	const { setPage, sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage, deckName, setDeckName, videoName, setVideoName } = useContext(AppContext)
	const continueDisabled = !sourceLanguage || !targetLanguage || !deckName || !videoName
	return (
		<Container style={{ maxWidth: "500px" }}>
			<Card className="mt-5">
				<Card.Header>Configuration</Card.Header>
				<Card.Body>
					<LanguageSelector value={sourceLanguage} onChange={l => setSourceLanguage(l)} label="Source Language" />
					<LanguageSelector value={targetLanguage} onChange={l => setTargetLanguage(l)} label="Target Language" />
					<Form.Group className="mb-3">
						<Form.Label>Deck Name</Form.Label>
						<Form.Control
							type="text"
							placeholder="Deck Name"
							value={deckName}
							onChange={event => setDeckName(event.target.value)}
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Video Name</Form.Label>
						<Form.Control
							type="text"
							placeholder="Video Name"
							value={videoName}
							onChange={event => setVideoName(event.target.value)}
						/>
						<Form.Text className="text-muted">
							For a TV show, use the season and episode number, e.g. "S01E01".
						</Form.Text>
					</Form.Group>
				</Card.Body>
				<Card.Footer className="d-flex justify-content-between">
					<Button variant="secondary" onClick={() => setPage("subtitles")}>Back</Button>
					<Button variant="primary" disabled={continueDisabled} onClick={() => setPage("flashcards")}>Continue</Button>
				</Card.Footer>
			</Card>
		</Container>
	)
}
export default ConfigPage