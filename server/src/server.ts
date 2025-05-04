import express from 'express'
import path from 'path'
import GrokAPI from './apis/grok'
import { FURIGANA_URL, FuriganaRequest, FuriganaResponse, NotesRequest, NotesResponse, TranslationRequest, TranslationResponse } from './data/api'
export default class Server {
    private grokApi: GrokAPI

    constructor(grokApi: GrokAPI) {
        this.grokApi = grokApi
    }
    start = async () => {
        const app = express()
        const port = process.env.PORT || 5000

        // Serve static files from Vite build output
        app.use(express.static(path.join(__dirname, '../../client/dist')))
        // Middleware to parse JSON request bodies
        app.use(express.json())

        // handle furigana AI requests
        app.post(FURIGANA_URL, async (req, res) => {
            const request: FuriganaRequest = req.body
            if (request.llm === 'Grok') {
                const response: FuriganaResponse = {
                    source: request.source,
                }
                try {
                    response.furigana = await this.grokApi.convertSourceToFurigana(request.source)
                } catch (error: any) {
                    response.error = error.message
                }
                res.json(response)
            }
            else {
                res.status(400).json({ error: 'Unsupported LLM' })
            }
        })

        //handle translation AI requests
        app.post('/api/translation', async (req, res) => {
            const request: TranslationRequest = req.body
            if (request.llm === 'Grok') {
                const response: TranslationResponse = {
                    source: request.source,
                }
                try {
                    response.translation = await this.grokApi.convertSourceToTranslation(request.source)
                } catch (error: any) {
                    response.error = error.message
                }
                res.json(response)
            }
            else {
                res.status(400).json({ error: 'Unsupported LLM' })
            }
        })

        //handle notes AI requests
        app.post('/api/notes', async (req, res) => {
            const request: NotesRequest = req.body
            if (request.llm === 'Grok') {
                const response: NotesResponse = {
                    source: request.source,
                }
                try {
                    response.notes = await this.grokApi.convertSourceToNotes(request.source)
                } catch (error: any) {
                    response.error = error.message
                }
                res.json(response)
            }
            else {
                res.status(400).json({ error: 'Unsupported LLM' })
            }
        })

        // Serve the React app
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
        })

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`)
        })
    }
}