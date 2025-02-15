import { ActivityType, Client, Events, GatewayIntentBits, SnowflakeUtil, WebSocketShardEvents } from 'discord.js';
import { config } from '../config/config.js';
import { constants } from '../config/constants.js';
import { CommandLoader } from './CommandLoader.js';
import { EventLoader } from './EventLoader.js';
import { dataSource } from './typeorm.config.js';

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
client.aqued = {
	config: config,
	events: new EventLoader(client, 'events'),
	commands: new CommandLoader('commands'),
	readyId: SnowflakeUtil.generate().toString(),
	cooldown: new Map(),
	freeChannelCooldown: new Map(),
	rolePanelCache: new Map()
};

client.on(Events.GuildCreate, () => changeStatus());
client.on(Events.GuildDelete, () => changeStatus());
client.ws.on(WebSocketShardEvents.Resumed, () => changeStatus());

await client.aqued.events.loadAllEvents();
await dataSource.initialize();
