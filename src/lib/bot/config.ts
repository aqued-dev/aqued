import { config } from 'dotenv';
config();
const discordToken = process.env.DISCORD_TOKEN;
const discordBotId = process.env.DISCORD_BOT_ID;
const dataBaseURL = process.env.DATABASE_URL;
if (!dataBaseURL || typeof dataBaseURL !== 'string')
	throw new Error('DataBase URLにString以外のものは入れることができません');
if (!discordBotId || typeof discordBotId !== 'string')
	throw new Error('Discord Bot IDにString以外のものは入れることができません');
if (!discordToken || typeof discordToken !== 'string')
	throw new Error('Discord TokenにString以外のものは入れることができません');
export const Config = { discordToken, dataBaseURL, discordBotId };
