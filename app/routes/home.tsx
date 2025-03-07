import { useEffect, useState } from "react"
import Card from '~/components/card'
import FocusedCard from '~/components/focused-card'
import type { Flashcard } from "~/interfaces"
import { convertSubtitleFiles } from '~/utils/subtitle-utils'
import { extractAudio, setVideo } from '~/utils/ffmpeg-utils'
import type { Route } from "./+types/home"

export function meta({ }: Route.MetaArgs) {
	return [
		{ title: "Video Flashcards Converter" },
		{ name: "description", content: "Welcome to the Video Flashcards Converter!" },
	]
}

export default function Home() {
	const [videoFile, setVideoFile] = useState<File | null>(null)
	// const [audioFile, setAudioFile] = useState<string | null>(null)
	// const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
	const [sourceSubtitleFile, setSourceSubtitleFile] = useState<File | null>(null)
	const [targetSubtitleFile, setTargetSubtitleFile] = useState<File | null>(null)
	const [flashcards, setFlashcards] = useState<Flashcard[]>([])
	const [focusedCard, setFocusedCard] = useState<number | null>(null)

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

	const handleTargetSubtitleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0]
			setTargetSubtitleFile(file)
		}
	}

	// useEffect(() => {
	// 	const fetchAudio = async () => {
	// 		if (videoFile) {
	// 			const { audioUrl, audioBuffer } = await extractAudio(videoFile)
	// 			setAudioFile(audioUrl)
	// 			setAudioBuffer(audioBuffer)
	// 		}
	// 	}
	// 	fetchAudio()
	// }, [videoFile])

	useEffect(() => {
		const fetchSubtitles = async () => {
			if (sourceSubtitleFile && targetSubtitleFile) {
				const flashcards = await convertSubtitleFiles(sourceSubtitleFile, targetSubtitleFile)
				setFlashcards(flashcards)
				console.log(flashcards)
			}
		}

		fetchSubtitles()
	}, [sourceSubtitleFile, targetSubtitleFile])

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

	return (
		<div>
			<label>Select a video file:</label>
			<br />
			<input type="file" accept="video/*" onChange={handleFileChange} />
			<br />
			<label>Select a subtitle file in the source language:</label>
			<br />
			<input type="file" accept=".srt,.vtt,.ass,.ssa" onChange={handleSourceSubtitleFileChange} />
			<br />
			<label>Select a subtitle file in the target language:</label>
			<br />
			<input type="file" accept=".srt,.vtt,.ass,.ssa" onChange={handleTargetSubtitleFileChange} />
			<br />
			{videoFile  && flashcards.slice(0, 10).map((flashcard, index) => (
				<div key={index} onClick={() => handleCardClick(index)}>
					{focusedCard === index ? (
						<FocusedCard
							video={videoFile}
							// audio={audioFile}
							// audioBuffer={audioBuffer}
							flashcard={flashcard}
							setFlashcard={(updatedFlashcard) => setFlashcard(index, updatedFlashcard)}
						/>
					) : (
						<Card subtitle={flashcard} />
					)}
				</div>
			))}
		</div>
	)
}
