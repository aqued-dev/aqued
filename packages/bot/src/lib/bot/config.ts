import { config } from 'dotenv';
config();
const discordToken = process.env.DISCORD_TOKEN;
const discordBotId = process.env.DISCORD_BOT_ID;
const geminiApiKey = process.env.GEMINI_API_KEY;
const dbHost = process.env.DB_HOST ?? 'db';
const dbUserName = process.env.DB_USER_NAME ?? 'user';
const dbPassword = process.env.DB_PASSWORD ?? 'password';
export const Config = { dbUserName, dbPassword, discordToken, discordBotId, geminiApiKey, dbHost };
