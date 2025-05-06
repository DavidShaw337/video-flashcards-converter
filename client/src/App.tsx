import { useContext } from "react"
import { AppContext, AppProvider } from "./components/app-context"
import ConfigPage from "./pages/config-page"
import ExportPage from "./pages/export-page"
import FlashcardsPage from "./pages/flashcards-page"
import StartPage from "./pages/start-page"
import SubtitlesPage from "./pages/subtitles-page"
import VideoPage from "./pages/video-page"

const App: React.FC = () => {
    return <AppProvider><Router /></AppProvider>
}
export default App

const Router: React.FC = () => {
    const { page } = useContext(AppContext)
    if (page === "start") return <StartPage />
    if (page === "video") return <VideoPage />
    if (page === "subtitles") return <SubtitlesPage />
    if (page === "config") return <ConfigPage />
    if (page === "flashcards") return <FlashcardsPage />
    if (page === "export") return <ExportPage />
    return null
}