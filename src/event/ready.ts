import { EventClass } from '../lib/index.js';
import { Client, Events } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.ClientReady;
	once = false;
	async run(client: Client) {
		client.logger.info('ready!!');
	}
}
