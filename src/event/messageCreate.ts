import { readdir } from 'node:fs/promises';
import { EventClass } from '../lib/index.js';
import { Events, Message } from 'discord.js';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.MessageCreate;
	once = false;
	async run(message: Message) {
		(await readdir(resolve(import.meta.dirname, 'messageCreate')))
			.filter((file) => file.endsWith('.js'))
			.map(async (file) => {
				const eventClass = (await import(`../event/messageCreate/${file}`)).default;
				const event = new eventClass();
				await event.run(message, message.client);
			});
	}
}
