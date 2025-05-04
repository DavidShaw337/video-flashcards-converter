import { useState } from "react"
import { LLM, NOTES_URL, NotesRequest, NotesResponse } from "../data/api"

const useNotesQuery = () => {
    const [data, setData] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const query = async (source: string) => {
        setLoading(true)
        setError(undefined)
        try {
            const request: NotesRequest = {
                llm: LLM.Grok,
                source,
            }
            const response = await fetch(NOTES_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            })
            if (!response.ok) {
                throw new Error(`Network response was ${response.status} ${response.statusText}`)
            }
            const result = await response.json() as NotesResponse
            setData(result.notes)
            return result.notes
        } catch (err: any) {
            setError(err.message)
            return undefined
        } finally {
            setLoading(false)
        }
    }
    return { query, data, loading, error }
}
export default useNotesQuery