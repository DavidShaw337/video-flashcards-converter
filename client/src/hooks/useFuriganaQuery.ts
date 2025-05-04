import { useState } from "react"
import { FURIGANA_URL, FuriganaRequest, FuriganaResponse, LLM } from "../data/api"

const useFuriganaQuery = () => {
    const [data, setData] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)
    const query = async (source: string) => {
        setLoading(true)
        setError(undefined)
        try {
            const request: FuriganaRequest = {
                llm: LLM.Grok,
                source,
            }
            const response = await fetch(FURIGANA_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            })
            if (!response.ok) {
                throw new Error(`Network response was ${response.status} ${response.statusText}`)
            }
            const result = await response.json() as FuriganaResponse
            setData(result.furigana)
            return result.furigana
        } catch (err: any) {
            setError(err.message)
            return undefined
        } finally {
            setLoading(false)
        }
    }
    return { query, data, loading, error }
}
export default useFuriganaQuery