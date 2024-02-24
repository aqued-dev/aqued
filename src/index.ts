/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Collection, Events, GatewayIntentBits, Routes } from 'discord.js';
import { exit } from 'node:process';
import { Config, EventClass, Logger, SlashCommandClass } from './lib/index.js';
import { Logger as PinoLogger } from 'pino';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
async function load(type: string) {
	const data = new Collection<string, SlashCommandClass>();
	(await readdir(resolve(import.meta.dirname, 'func', type)))
		.filter((file) => file.endsWith('.js'))
		// eslint-disable-next-line unicorn/no-array-for-each
		.forEach(async (file) => {
			const slashClass = (await import(`../src/func/${type}/${file}`)).default;
			const slash: SlashCommandClass = new slashClass();
			data.set(slash.command.name, slash);
		});

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
	// eslint-disable-next-line unicorn/no-array-for-each
	.forEach(async (file = 'ready.js') => {
		const eventClass = (await import(`../src/event/${file}`)).default;
		const event: EventClass<any> = new eventClass();
		client[event.once ? 'once' : 'on'](event.name, async (...args) => await event.run(...args));
	});

const commandsData = [...client.loads.slash.values()].map((slash) => slash.command.toJSON());
await client.rest
	.put(Routes.applicationCommands(Config.discordBotId), {
		body: commandsData,
	})
	.then(() => Logger.info('コマンドを登録しました'))
	.catch((error_) => {
		Logger.error(error_);
		Logger.error('コマンドが登録できませんでした');
		exit(1);
	});

client.on(Events.Debug, (message) => Logger.info(message));

await client
	.login(client.config.discordToken)
	.then(() => Logger.info('Login Success.'))
	.catch((error_) => {
		Logger.error(error_);
		exit(1);
	});
