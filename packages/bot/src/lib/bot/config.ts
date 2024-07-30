import { config } from 'dotenv';
config();
const discordToken = process.env.DISCORD_TOKEN;
const discordBotId = process.env.DISCORD_BOT_ID;
const geminiApiKey = process.env.GEMINI_API_KEY;
const dbHost = process.env.DB_HOST ?? 'db';

export const Config = { discordToken, discordBotId, geminiApiKey, dbHost };
