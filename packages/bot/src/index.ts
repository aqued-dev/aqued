import { Client, Events, GatewayIntentBits, Routes } from 'discord.js';
import { exit } from 'node:process';
import {
	Config,
	EventClass,
	InteractionEventClass,
	Logger,
	MessageEventClass,
	SlashCommandClass,
} from './lib/index.js';
import { Logger as PinoLogger } from 'pino';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import EQ from './lib/earthquake.js';
import { dataSource } from './lib/db/dataSource.js';

process.on('unhandledRejection', (reason) => Logger.error(reason));
process.on('uncaughtException', (reason) => Logger.error(reason));
async function load(type: string) {
	const data = new Map<string, SlashCommandClass>();
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

const events = new Map<string, (MessageEventClass | InteractionEventClass)[]>();

const messageEventFiles = await readdir(resolve(import.meta.dirname, 'event', 'messageCreate'));
const messageArray = [];
messageEventFiles
	.filter((file) => file.endsWith('.js'))
	.forEach(async (file) => {
		const eventClass = (await import(`./event/messageCreate/${file}`)).default;
		const event: MessageEventClass = new eventClass();
		messageArray.push(event);
	});
events.set(Events.MessageCreate, messageArray);

const interactionEventFiles = await readdir(resolve(import.meta.dirname, 'event', 'interactions'));
const interactionArray = [];
interactionEventFiles
	.filter((file) => file.endsWith('.js'))
	.forEach(async (file) => {
		const eventClass = (await import(`./event/interactions/${file}`)).default;
		const event: InteractionEventClass = new eventClass();
		interactionArray.push(event);
	});
events.set(Events.InteractionCreate, interactionArray);

declare module 'discord.js' {
	interface Client {
		loads: {
			slash?: Map<string, SlashCommandClass>;
			events?: Map<string, (MessageEventClass | InteractionEventClass)[]>;
		};
		cache: Map<string, string>;
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
await EQ(client);
client.loads = { slash: await load('slash'), events };
client.cache = new Map();
client.logger = Logger;
client.config = Config;
(await readdir(resolve(import.meta.dirname, 'event')))
	.filter((file) => file.endsWith('.js'))
	.map(async (file) => {
		const eventClass = (await import(`../src/event/${file}`)).default;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const event: EventClass<any> = new eventClass();
		client[event.once ? 'once' : 'on'](event.name, async (...args) => await event.run(client, ...args));
	});
const commandsData = [...client.loads.slash.values()]
	.filter((slash) => !slash.guildId)
	.map((slash) => slash.command.toJSON());
const guildCommands = [...client.loads.slash.values()].filter((slash) => slash.guildId);
await client.rest
	.put(Routes.applicationCommands(Config.discordBotId), {
		body: commandsData,
	})
	.then(() => client.logger.info('command has been registered!'))
	.catch((error_) => {
		client.logger.error(error_);
		client.logger.error('Could not register command :(');
		exit(1);
	});
await Promise.all(
	guildCommands.map(
		async (command) =>
			await client.rest
				.put(Routes.applicationGuildCommands(Config.discordBotId, command.guildId), {
					body: [command.command.toJSON()],
				})
				.then(() => client.logger.info('command has been registered!'))
				.catch((error_) => {
					client.logger.error(error_);
					client.logger.error('Could not register command :(');
					exit(1);
				}),
	),
);

// client.on(Events.Debug, (message) => client.logger.info(message));
await dataSource.initialize();

await client
	.login(client.config.discordToken)
	.then(() => client.logger.info('Login Success.'))
	.catch((error_) => {
		client.logger.error(error_);
		exit(1);
	});
