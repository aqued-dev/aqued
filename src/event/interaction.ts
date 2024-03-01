import { readdir } from 'node:fs/promises';
import { EventClass } from '../lib/index.js';
import { BaseInteraction, Client, Events } from 'discord.js';
import { resolve } from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.InteractionCreate;
	once = false;
	async run(client: Client, interaction: BaseInteraction) {
		(await readdir(resolve(import.meta.dirname, 'interactions')))
			.filter((file) => file.endsWith('.js'))
			.map(async (file) => {
				const eventClass = (await import(`../event/interactions/${file}`)).default;
				const event = new eventClass();
				await event.run(interaction, client);
			});
	}
}
