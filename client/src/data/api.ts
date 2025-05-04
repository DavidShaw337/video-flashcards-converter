export const FURIGANA_URL = '/api/furigana'
export interface FuriganaRequest {
    llm: LLM
    source: string
}
export interface FuriganaResponse {
    source: string
    furigana: string
}
export const TRANSLATION_URL = '/api/translation'
export interface TranslationRequest {
    llm: LLM
    source: string
}
export interface TranslationResponse {
    source: string
    translation: string
}
export const NOTES_URL = '/api/notes'
export interface NotesRequest {
    llm: LLM
    source: string
}
export interface NotesResponse {
    source: string
    notes: string
}
export enum LLM {
    ChatGPT = 'ChatGPT',
    Grok = 'Grok',
}