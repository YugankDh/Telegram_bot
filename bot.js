const TelegramBot = require("node-telegram-bot-api")
require("dotenv").config()
const { GoogleGenerativeAI } = require("@google/generative-ai")

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

const quote_apiurl = "https://zenquotes.io/api/random"
const fact_apiurl = "https://uselessfacts.jsph.pl/api/v2/facts/random"
const meme_url = "https://meme-api.com/gimme"

// Functions to fetch API data
async function getFact() {
    try {
        const response = await fetch(fact_apiurl)
        const data = await response.json()
        return data.text
    } catch (error) {
        console.error("Error fetching fact:", error)
        return "An error occurred while fetching the fact."
    }
}

async function getQuote() {
    try {
        const response = await fetch(quote_apiurl)
        const data = await response.json()
        return data[0].q
    } catch (error) {
        console.error("Error fetching quote:", error)
        return "An error occurred while fetching the quote."
    }
}

async function memeTitle() {
    try {
        const response = await fetch(meme_url)
        const data = await response.json()
        return data.title
    } catch (error) {
        console.error("Error fetching meme title:", error)
        return "An error occurred while fetching the meme title."
    }
}

async function memeImg() {
    try {
        const response = await fetch(meme_url)
        const data = await response.json()
        return data.url
    } catch (error) {
        console.error("Error fetching meme image:", error)
        return "An error occurred while fetching the meme image."
    }
}

// Command to generate AI content
bot.onText(/\/chat (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const prompt = match[1]
    try {
        const genAI = new GoogleGenerativeAI(process.env.api_key)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(prompt)
        bot.sendMessage(chatId, result.response.text())
    } catch (error) {
        console.error("Error generating AI content:", error)
        bot.sendMessage(chatId, "An error occurred while generating content.")
    }
})

// Handling other messages
bot.on("message", async (msg) => {
    const chatId = msg.chat.id
    const text = msg.text ? msg.text.toLowerCase() : null

     if (!text) {
        bot.sendMessage(chatId,"please only send messages in this bot")
        return
    }

    if (text === "$quote") {
        const quote = await getQuote()
        bot.sendMessage(chatId, quote)
    }

    if (text === "$fact") {
        const fact = await getFact()
        bot.sendMessage(chatId, fact)
    }

    if (text === "$meme") {
        const meme = await memeImg()
        const memeTitleText = await memeTitle()
        bot.sendMessage(chatId, memeTitleText)
        bot.sendPhoto(chatId, meme)
    }
})
