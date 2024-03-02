import { EventClass } from '../lib/index.js';
import { Client, Events, Message } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.MessageCreate;
	once = false;
	async run(client: Client, message: Message) {
		client.loads.events.get(Events.MessageCreate).map(async (value) => await value.run(message, client));
	}
}
