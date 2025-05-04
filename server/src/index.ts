import express from 'express'
import path from 'path'
import { FURIGANA_URL, FuriganaRequest, FuriganaResponse, NotesRequest, NotesResponse, TranslationRequest, TranslationResponse } from './api'

const app = express()
const port = process.env.PORT || 5000

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, '../../client/dist')))
// Middleware to parse JSON request bodies
app.use(express.json())

// handle furigana AI requests
app.post(FURIGANA_URL, (req, res) => {
  const request: FuriganaRequest = req.body
  const response: FuriganaResponse = {
    source: request.source,
    furigana: request.source
  }
  res.json(response)
})

//handle translation AI requests
app.post('/api/translation', (req, res) => {
  const request: TranslationRequest = req.body
  const response: TranslationResponse = {
    source: request.source,
    translation: request.source
  }
  res.json(response)
})

//handle notes AI requests
app.post('/api/notes', (req, res) => {
  const request: NotesRequest = req.body
  const response: NotesResponse = {
    source: request.source,
    notes: request.source
  }
  res.json(response)
})

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
