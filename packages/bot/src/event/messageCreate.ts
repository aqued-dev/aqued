import { EventClass, isMessageEvent } from '../lib/index.js';
import { Client, Events, Message } from 'discord.js';

export default class implements EventClass<Events.MessageCreate> {
	name = Events.MessageCreate;
	once = false;
	async run(client: Client, message: Message) {
		for (const value of client.loads.events.get(Events.MessageCreate)) {
			if (!isMessageEvent(value)) return;
			await value.run(message, client);
		}
	}
}
