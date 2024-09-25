import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
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
	presence: { status: 'idle', activities: [{ name: 'Idle...', type: ActivityType.Custom }] },
});
client.token = config.bot.token;

declare module 'discord.js' {
	interface Client {
		aqued: {
			events: EventLoader;
			config: typeof config;
			commands: { chatInput: CommandLoader };
		};
	}
}
client.aqued = {
	config: config,
	events: new EventLoader(client, 'events'),
	commands: {
		chatInput: new CommandLoader('commands/chatInput'),
	},
};

await client.aqued.events.loadAllEvents();
