import { BaseInteraction, Client } from 'discord.js';
import { InteractionEventClass } from 'src/lib/index.js';

export default class implements InteractionEventClass {
	async run(interaction: BaseInteraction, client: Client) {
		if (!interaction.isButton()) return;
		await Promise.all(
			[...client.loads.slash.values()].map(async (value) => {
				if (value.button) await value.button(interaction);
			}),
		);
	}
}
