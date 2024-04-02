import { config } from 'dotenv';
config();
const discordToken = process.env.DISCORD_TOKEN;
const discordBotId = process.env.DISCORD_BOT_ID;
const dataBaseURL = process.env.DATABASE_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;

export const Config = { discordToken, dataBaseURL, discordBotId, geminiApiKey };
