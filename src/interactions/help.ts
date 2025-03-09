import { ApplicationCommandOptionChoiceData, BaseInteraction } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isAutocomplete() && interaction.commandName === 'help') {
		const value = interaction.options.getFocused();
		const commandNames = interaction.client.botData.commands.chatInput.map((value) => value.name);
		const choice: ApplicationCommandOptionChoiceData[] = [];
		for (const name of commandNames) {
			if (!name.includes(value)) {
				continue;
			}
			choice.push({ name: name, value: name });
		}
		await interaction.respond(choice);
	}
}
