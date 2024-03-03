import { EventClass } from '../lib/index.js';
import { BaseInteraction, Client, Events } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class implements EventClass<any> {
	name = Events.InteractionCreate;
	once = false;
	async run(client: Client, interaction: BaseInteraction) {
		for (const value of client.loads.events.get(Events.InteractionCreate)) {
			await value.run(interaction, client);
		}
	}
}
