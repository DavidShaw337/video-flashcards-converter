import { useEffect, useRef, useState } from "react"
import { Flashcard } from "./interfaces"
import { setVideo } from "./utils/ffmpeg-utils"
import { convertSubtitleFiles } from "./utils/subtitle-utils"
import LanguageSelector from "./components/language-selector"
import FocusedCard from "./components/focused-card"
import { downloadFlashcards } from "./utils/download-utils"
import Card from "./components/card"
import "normalize.css"
import "./index.css"


export default function App() {
	const [sourceLanguage, setSourceLanguage] = useState<string>("ja")
	const [targetLanguage, setTargetLanguage] = useState<string>("en")
	const [deckName, setDeckName] = useState<string>("Flashcards")
	const [videoName, setVideoName] = useState<string>("Video")
	const [videoFile, setVideoFile] = useState<File | null>(null)
	const [sourceSubtitleFile, setSourceSubtitleFile] = useState<File | null>(null)
	const [flashcards, setFlashcards] = useState<Flashcard[]>([])
	const startOffset = useRef(0)
	const endOffset = useRef(0)
	const [focusedCard, setFocusedCard] = useState<number | null>(null)

	//test api
	const [message, setMessage] = useState<string>('')
    useEffect(() => {
        fetch('/api')
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
    }, []);
	//

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0]
			setVideoFile(file)
			await setVideo(file)
		}
	}

	const handleSourceSubtitleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0]
			setSourceSubtitleFile(file)
		}
	}

	useEffect(() => {
		const fetchSubtitles = async () => {
			if (sourceSubtitleFile) {
				const flashcards = await convertSubtitleFiles(sourceSubtitleFile)
				setFlashcards(flashcards)
				console.log(flashcards)
			}
		}

		fetchSubtitles()
	}, [sourceSubtitleFile])

	const handleCardClick = (index: number) => {
		setFocusedCard(index)
	}

	const setFlashcard = (index: number, updatedFlashcard: Flashcard) => {
		setFlashcards((prevFlashcards) => {
			const newFlashcards = [...prevFlashcards]
			newFlashcards[index] = updatedFlashcard
			return newFlashcards
		})
	}
	useEffect(() => {
		let sOffset = 0
		let sCount = 0
		let eOffset = 0
		let eCount = 0
		for (const flashcard of flashcards) {
			if (flashcard.selectedStartTime) {
				sOffset += flashcard.selectedStartTime - flashcard.originalStartTime
				sCount++
			}
			if (flashcard.selectedEndTime) {
				eOffset += flashcard.selectedEndTime - flashcard.originalEndTime
				eCount++
			}
		}
		if (sCount > 0) {
			startOffset.current = Math.round(sOffset / sCount * 10) / 10
		}
		if (eCount > 0) {
			endOffset.current = Math.round(eOffset / eCount * 10) / 10
		}
	}, [flashcards])
	return (
		<div>
			<h1>Video Flashcards Converter</h1>
			<p>{message}</p>
			<div>
				<label htmlFor="deckName">Deck Name: </label>
				<input
					id="deckName"
					type="text"
					value={deckName}
					onChange={event => setDeckName(event.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="videoName">Video Name: </label>
				<input
					id="videoName"
					type="text"
					value={videoName}
					onChange={event => setVideoName(event.target.value)}
				/>
			</div>
			<LanguageSelector value={sourceLanguage} onChange={l => setSourceLanguage(l)} label="Source Language: " id="source-language" />
			<LanguageSelector value={targetLanguage} onChange={l => setTargetLanguage(l)} label="Target Language: " id="target-language" />
			<label>Select a video file:</label>
			<br />
			<input type="file" accept="video/*" onChange={handleFileChange} />
			<br />
			<label>Select a subtitle file in the source language:</label>
			<br />
			<input type="file" accept=".srt,.vtt,.ass,.ssa" onChange={handleSourceSubtitleFileChange} />
			<br />
			{videoFile && flashcards.map((flashcard, index) => (
				<div key={index} onClick={() => handleCardClick(index)}>
					{focusedCard === index ? (
						<FocusedCard
							video={videoFile}
							flashcards={flashcards}
							flashcardIndex={index}
							startOffset={startOffset}
							endOffset={endOffset}
							setFlashcard={(updatedFlashcard) => setFlashcard(index, updatedFlashcard)}
						/>
					) : (
						<Card subtitle={flashcard} />
					)}
				</div>
			))}
			<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
				<button
					style={{
						padding: '12px 25px',
						fontSize: '16px',
						backgroundColor: '#4CAF50', /* Green background */
						color: 'white', /* White text */
						border: 'none', /* Remove default border */
						borderRadius: '5px', /* Rounded corners */
						cursor: 'pointer', /* Pointer cursor on hover */
						transition: 'background-color 0.3s ease', /* Smooth transition for hover effect */
					}}
					onClick={() => downloadFlashcards(flashcards, deckName, videoName, sourceLanguage)}
				>
					Download
				</button>
			</div>
		</div>
	)
}