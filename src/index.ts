/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Collection, GatewayIntentBits, Routes } from 'discord.js';
import { exit } from 'node:process';
import { Config, EventClass, Logger, SlashCommandClass } from './lib/index.js';
import { Logger as PinoLogger } from 'pino';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
async function load(type: string) {
	const data = new Collection<string, SlashCommandClass>();
	const files = await readdir(resolve(import.meta.dirname, 'func', type));

	await Promise.all(
		files
			.filter((file) => file.endsWith('.js'))
			.map(async (file) => {
				const slashClass = (await import(`../src/func/${type}/${file}`)).default;
				const slash: SlashCommandClass = new slashClass();
				data.set(slash.command.name, slash);
			}),
	);
	return data;
}

declare module 'discord.js' {
	interface Client {
		loads: { slash: Collection<string, SlashCommandClass> };
		logger: PinoLogger;
		config: typeof Config;
	}
}
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildPresences,
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'dnd' },
});
client.rest.setToken(Config.discordToken);

client.loads = { slash: await load('slash') };

client.logger = Logger;
client.config = Config;

(await readdir(resolve(import.meta.dirname, 'event')))
	.filter((file) => file.endsWith('.js'))
	.map(async (file) => {
		const eventClass = (await import(`../src/event/${file}`)).default;
		const event: EventClass<any> = new eventClass();
		client[event.once ? 'once' : 'on'](event.name, async (...args) => await event.run(...args));
	});

const commandsData = [...client.loads.slash.values()].map((slash) => slash.command.toJSON());
await client.rest
	.put(Routes.applicationCommands(Config.discordBotId), {
		body: commandsData,
	})
	.then(() => Logger.info('command has been registered!'))
	.catch((error_) => {
		Logger.error(error_);
		Logger.error('Could not register command :(');
		exit(1);
	});
// client.on(Events.Debug, (message) => Logger.info(message));

await client
	.login(client.config.discordToken)
	.then(() => Logger.info('Login Success.'))
	.catch((error_) => {
		Logger.error(error_);
		exit(1);
	});
