import { BaseInteraction, Events, type ApplicationCommandOptionChoiceData } from 'discord.js';
import { type EventListener } from '../../../core/types/EventListener.js';

export default class HelpAutoComplate implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isAutocomplete()) {
			return;
		}
		if (interaction.commandName !== 'help') {
			return;
		}

		const focusedValue = interaction.options.getFocused();
		const choice: ApplicationCommandOptionChoiceData[] = [];
		const commandNames = Array.from(interaction.client.aqued.commands.commands.values()).map(
			(item) => item.command.name
		);

		for (const name of commandNames) {
			if (!name.includes(focusedValue)) {
				continue;
			}
			choice.push({ name: name, value: name });
		}
		return await interaction.respond(choice);
	}
}
