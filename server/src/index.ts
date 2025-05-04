import dotenv from 'dotenv'
import Server from './server'
import GrokAPI from './apis/grok'

dotenv.config()
if (!process.env.GROK_API_KEY) {
	throw new Error('GROK_API_KEY is not defined in the environment variables')
}
const grokApi = new GrokAPI(process.env.GROK_API_KEY)
new Server(grokApi).start()
