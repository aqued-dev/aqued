import { ActivityType, Client, GatewayIntentBits, SnowflakeUtil } from 'discord.js';
import { config } from '../config/config.js';
import { CommandLoader } from './CommandLoader.js';
import { EventLoader } from './EventLoader.js';
import { dataSource } from './typeorm.config.js';
import type { ChatInputCommand } from './types/ChatInputCommand.js';
import type { MessageContextMenuCommand, UserContextMenuCommand } from './types/ContextCommand.js';
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildPresences
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'idle', activities: [{ name: 'v3.5 Refactor', type: ActivityType.Custom }] }
});
client.token = config.bot.token;

declare module 'discord.js' {
	interface Client {
		aqued: {
			events: EventLoader;
			config: typeof config;
			commands: CommandLoader<ChatInputCommand | MessageContextMenuCommand | UserContextMenuCommand>;
			readyId: string;
			cooldown: Map<string, Map<string, number>>;
		};
	}
}
client.aqued = {
	config: config,
	events: new EventLoader(client, 'events'),
	commands: new CommandLoader('commands'),
	readyId: SnowflakeUtil.generate().toString(),
	cooldown: new Map()
};

await client.aqued.events.loadAllEvents();
await dataSource.initialize();
