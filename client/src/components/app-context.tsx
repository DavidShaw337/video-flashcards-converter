import React, { useState } from "react"
import { Flashcard } from "../data/interfaces"
import useLocalStorage from "../hooks/useLocalStorage"

interface IAppContext {
    page: string,
    setPage: (s: string) => void,
    sourceLanguage: string,
    setSourceLanguage: (s: string) => void,
    targetLanguage: string,
    setTargetLanguage: (s: string) => void,
    deckName: string,
    setDeckName: (s: string) => void,
    videoName: string,
    setVideoName: (s: string) => void,
    videoFile: File | null,
    setVideoFile: (f: File | null) => void,
    subtitleFile: File | null,
    setSubtitleFile: (f: File | null) => void,
    flashcards: Flashcard[],
    setFlashcards: (f: Flashcard[] | ((f: Flashcard[]) => Flashcard[])) => void,
}
const AppContext = React.createContext<IAppContext>({
    page: "",
    setPage: () => { },
    sourceLanguage: "",
    setSourceLanguage: () => { },
    targetLanguage: "",
    setTargetLanguage: () => { },
    deckName: "",
    setDeckName: () => { },
    videoName: "",
    setVideoName: () => { },
    videoFile: null,
    setVideoFile: () => { },
    subtitleFile: null,
    setSubtitleFile: () => { },
    flashcards: [],
    setFlashcards: () => { },
})

const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [page, setPage] = useState<string>("start")
    const [sourceLanguage, setSourceLanguage] = useLocalStorage<string>("sourceLanguage", "ja")
    const [targetLanguage, setTargetLanguage] = useLocalStorage<string>("targetLanguage", "en")
    const [deckName, setDeckName] = useLocalStorage<string>("deckName", "Flashcards")
    const [videoName, setVideoName] = useLocalStorage<string>("videoName", "Video")
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
    const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>("flashcards", [])
    const value: IAppContext = {
        page, setPage, sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage, deckName, setDeckName, videoName, setVideoName, videoFile, setVideoFile, subtitleFile, setSubtitleFile, flashcards, setFlashcards
    }
    return (
        <AppContext.Provider value={value}>{children}</AppContext.Provider>
    )
}
export { AppContext, AppProvider }

