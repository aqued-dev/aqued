import { ActivityType, Client, GatewayIntentBits, SnowflakeUtil } from 'discord.js';
import { config } from '../config/config.js';
import { CommandLoader } from './CommandLoader.js';
import { EventLoader } from './EventLoader.js';
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildPresences,
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'idle', activities: [{ name: 'v3.5 Refactor', type: ActivityType.Custom }] },
});
client.token = config.bot.token;

declare module 'discord.js' {
	interface Client {
		aqued: {
			events: EventLoader;
			config: typeof config;
			commands: { chatInput: CommandLoader };
			readyId: string;
		};
	}
}
client.aqued = {
	config: config,
	events: new EventLoader(client, 'events'),
	commands: {
		chatInput: new CommandLoader('commands/chatInput'),
	},
	readyId: SnowflakeUtil.generate().toString(),
};

await client.aqued.events.loadAllEvents();
