import { ActivityType, Client, Events, GatewayIntentBits, SnowflakeUtil } from 'discord.js';
import { config } from '../config/config.js';
import { constants } from '../config/constants.js';
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
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'idle', activities: [{ name: 'Wake Up...', type: ActivityType.Custom }] }
});
client.token = config.bot.token;
function changeStatus() {
	return client.user?.setActivity({
		name: `/help | ${client.guilds.cache.size} Servers | v${constants.version}`,
		type: ActivityType.Custom
	});
}
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

client.on(Events.GuildCreate, () => changeStatus());
client.on(Events.GuildDelete, () => changeStatus());
client.on(Events.ShardResume, () => changeStatus());

await client.aqued.events.loadAllEvents();
await dataSource.initialize();
