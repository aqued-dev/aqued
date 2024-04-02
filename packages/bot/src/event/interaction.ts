import { EventClass, isInteraction } from '../lib/index.js';
import { BaseInteraction, Client, Events } from 'discord.js';

export default class implements EventClass<Events.InteractionCreate> {
	name = Events.InteractionCreate;
	once = false;
	async run(client: Client, interaction: BaseInteraction) {
		for (const value of client.loads.events.get(Events.InteractionCreate)) {
			if (!isInteraction(value)) return;
			await value.run(interaction, client);
		}
	}
}
