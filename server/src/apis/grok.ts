


export default class GrokAPI {
    private apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    convertSourceToFurigana = async (source: string) => {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are a tool for adding furigana to Japanese text. e.g. 私[わたし]は Make sure to add it to every Kanji character. You will only respond with the requested information."
                    },
                    {
                        role: "user",
                        content: source
                    }
                ],
                model: "grok-3-latest"
            })
        })

        const data = await response.json()
        if (data.choices.length > 1) {
            console.log("Warning: More than one choice returned from Grok API. Using the first one.")
            console.log(data.choices)
        }
        console.log(data.usage.total_tokens + " tokens")
        return data.choices[0].message.content
    }
    convertSourceToTranslation = async (source: string) => {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are a tool for translating Japanese subtitles to English. Try to give a more literal translation without feeling too unnatural. You will only respond with the translation."
                    },
                    {
                        role: "user",
                        content: source
                    }
                ],
                model: "grok-3-latest"
            })
        })

        const data = await response.json()
        if (data.choices.length > 1) {
            console.log("Warning: More than one choice returned from Grok API. Using the first one.")
            console.log(data.choices)
        }
        console.log(data.usage.total_tokens + " tokens")
        return data.choices[0].message.content
    }
    convertSourceToNotes = async (source: string) => {
        const kanjiCount = source.split('').filter(char => char.match(/[\u4e00-\u9faf]/)).length;
        // console.log(source + "---" + source.length + "---" + kanjiCount)
        let phraseCount = "Choose the 3 least common words or phrases. "
        if (source.length < 12 && kanjiCount < 6) phraseCount = "Choose the 2 least common words or phrases. "
        if (source.length < 7 && kanjiCount < 4) phraseCount = "Choose the least common word or phrase. "
        //
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are a tool for generating study notes for Japanese subtitles. "
                            + phraseCount
                            + "Give a definition for each, 2-7 words. "
                            // + "Focus on picking uncommon words or words used in uncommon ways, but don't commont on how common they are. "
                            + "Do not include super common words like 私, これ, 何, etc. "
                            // + "If the word is super common, then just give the meaning. "
                            + "Format each note like this: \"世界 - world\". Don't add any line numbers. "
                            + "Each note should be on a separate line. There should be no other line breaks. "
                        // + "The notes should be in the same order as the subtitles. "
                        // + "You will only respond with the requested information."
                    },
                    {
                        role: "user",
                        content: source
                    }
                ],
                model: "grok-3-latest"
            })
        })

        const data = await response.json()
        if (data.choices.length > 1) {
            console.log("Warning: More than one choice returned from Grok API. Using the first one.")
            console.log(data.choices)
        }
        console.log(data.usage.total_tokens + " tokens")
        return data.choices[0].message.content
    }
}