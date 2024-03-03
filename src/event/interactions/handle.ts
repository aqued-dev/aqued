import { BaseInteraction, Client, EmbedBuilder } from 'discord.js';
import { InteractionEventClass } from 'src/lib/index.js';

export default class implements InteractionEventClass {
	async run(interaction: BaseInteraction, client: Client) {
		if (interaction.isChatInputCommand()) {
			const command = client.loads.slash.get(interaction.commandName);
			if (!command) {
				await interaction.reply({
					embeds: [new EmbedBuilder().setTitle('コマンドが見つかりません').setDescription('no')],
				});
				return;
			}

			await command.run(interaction);
		} else {
			await Promise.all(
				[...client.loads.slash.values()].map(async (value) => {
					if (value.button && interaction.isButton()) await value.button(interaction);
					if (value.modal && interaction.isModalSubmit()) await value.modal(interaction);
				}),
			);
		}
	}
}
