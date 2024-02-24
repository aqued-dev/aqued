/* eslint-disable @typescript-eslint/no-unused-vars */
import { setInterval } from 'node:timers/promises';
import { EventClass } from '../lib/index.js';
import { ActivityType, Client, Events } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.ClientReady;
	once = false;
	async run(client: Client) {
		client.logger.info('ready!!');
		client.user.setPresence({
			status: 'idle',
			activities: [
				{
					name: `/help | ${client.guilds.cache.size} Guilds | ${String(client.ws.ping) === '-1' ? '?' : client.ws.ping} ms`,
					type: ActivityType.Custom,
				},
			],
		});
		for await (const _ of setInterval(60 * 1000)) {
			client.user.setPresence({
				status: 'idle',
				activities: [
					{
						name: `/help | ${client.guilds.cache.size} Guilds | ${String(client.ws.ping) === '-1' ? '?' : client.ws.ping} ms`,
						type: ActivityType.Custom,
					},
				],
			});
		}
	}
}
