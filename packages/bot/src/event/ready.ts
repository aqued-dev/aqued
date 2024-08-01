import { EventClass, userFormat } from '../lib/index.js';
import { ActivityType, Client, Events } from 'discord.js';

export default class implements EventClass<Events.ClientReady> {
	name = Events.ClientReady;
	once = false;
	async run(client: Client) {
		client.logger.info('ready!!');
		client.logger.info(`bot: ${userFormat(client.user)}`);
		client.user.setPresence({
			status: 'idle',
			activities: [
				{
					name: `/help | ${client.guilds.cache.size} Guilds | ${String(client.ws.ping) === '-1' ? '?' : client.ws.ping} ms`,
					type: ActivityType.Custom,
				},
			],
		});
		setInterval(async () => {
			client.user.setPresence({
				status: 'idle',
				activities: [
					{
						name: `/help | ${client.guilds.cache.size} Guilds | ${String(client.ws.ping) === '-1' ? '?' : client.ws.ping} ms`,
						type: ActivityType.Custom,
					},
				],
			});
		}, 60 * 1000);
	}
}
