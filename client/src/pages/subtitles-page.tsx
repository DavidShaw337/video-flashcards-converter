import { useContext } from "react"
import { Button, Card, Container, Form } from "react-bootstrap"
import { AppContext } from "../components/app-context"
import { convertSRTFileToFlashcards } from "../utils/subtitle-utils"

const SubtitlesPage: React.FC = () => {
	const { setPage, subtitleFile, setSubtitleFile, flashcards, setFlashcards } = useContext(AppContext)
	const continueDisabled = flashcards.length === 0
	return (
		<Container style={{ maxWidth: "500px" }}>
			<Card className="mt-5">
				<Card.Header>Configuration</Card.Header>
				<Card.Body>
					{flashcards.length > 0 ?
						<Card.Text>
							If you want to start over, select the subtitle file again to overwrite the existing flashcards.
							<br /><br />
							If you want to continue your previous work, just select Continue.
						</Card.Text> :
						<Card.Text>Select the file with subtitles in the original language.</Card.Text>}
					<Form.Group className="mb-3" controlId="subtitleFile">
						<Form.Label>Subtitle File</Form.Label>
						<Form.Control
							type="file"
							accept=".srt"
							// accept=".srt,.vtt,.ass,.ssa" //TODO allow other subtitle formats
							onChange={event => {
								const target = event.target as HTMLInputElement
								if (target.files && target.files.length > 0) {
									setSubtitleFile(target.files[0])
								}
							}}
						/>
						<Form.Text className="text-muted">
							The subtitle file must be in the original language.
						</Form.Text>
					</Form.Group>
				</Card.Body>
				<Card.Footer className="d-flex justify-content-between">
					<Button variant="secondary" onClick={() => setPage("video")}>Back</Button>
					<Button variant="outline-primary" disabled={!subtitleFile} onClick={async () => {
						const flashcards = await convertSRTFileToFlashcards(subtitleFile!)
						setFlashcards(flashcards)
						console.log(flashcards)
						setPage("config")
					}}>Process Subtitles</Button>
					<Button variant="primary" disabled={continueDisabled} onClick={() => setPage("config")}>Continue</Button>
				</Card.Footer>
			</Card>
		</Container>
	)
}
export default SubtitlesPage