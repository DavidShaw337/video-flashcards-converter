import { useContext } from "react"
import { Button, Card, Container, Form } from "react-bootstrap"
import { AppContext } from "../components/app-context"
import { setVideo } from "../utils/ffmpeg-utils"



const VideoPage: React.FC = () => {
	const { setPage, videoFile, setVideoFile, flashcards } = useContext(AppContext)
	const continueDisabled = !videoFile
	return (
		<Container style={{ maxWidth: "800px" }}>
			<Card className="mt-5">
				<Card.Header>Configuration</Card.Header>
				<Card.Body>
					<Card.Text>{flashcards.length > 0 ? "It looks like you have already started a project. If you would like to continue, please select the same video file again." :
						"Select the video file to extract screenshots and audio from."}</Card.Text>
					<ul>
						<li>The video needs to not have baked in subtitles, and the audio needs to be in the original language.</li>
						<li>All video and audio editing is done on your device. This file is not uploaded to any remote servers.</li>
						<li>If you leave this page and come back, you will need to re-select the video file.</li>
					</ul>
					<Form.Group className="mb-3" controlId="videoFile">
						<Form.Label>Video File</Form.Label>
						<Form.Control
							type="file"
							accept="video/*"
							onChange={event => {
								const target = event.target as HTMLInputElement
								if (target.files && target.files.length > 0) {
									setVideo(target.files[0])
									setVideoFile(target.files[0])
								}
							}}
						/>
						<Form.Text className="text-muted">
							All video and audio editing is done on your device. This file is not uploaded to any remote servers.
							If you leave this page and come back, you will need to re-select the video file.
						</Form.Text>
					</Form.Group>
				</Card.Body>
				<Card.Footer className="d-flex justify-content-between">
					<Button variant="danger" onClick={() => {
						localStorage.clear()
						window.location.reload()
					}}>Clear</Button>
					<Button variant="primary" disabled={continueDisabled} onClick={() => setPage("subtitles")}>Continue</Button>
				</Card.Footer>
			</Card>
		</Container>
	)
}
export default VideoPage