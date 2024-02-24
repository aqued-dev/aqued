import { BaseInteraction, Client, EmbedBuilder } from 'discord.js';
import { InteractionEventClass } from 'src/lib/index.js';

export default class implements InteractionEventClass {
	async run(interaction: BaseInteraction, client: Client) {
		if (!interaction.isChatInputCommand()) return;
		const command = client.loads.slash.get(interaction.commandName);
		if (!command) {
			await interaction.reply({
				embeds: [new EmbedBuilder().setTitle('コマンドが見つかりません。').setDescription('no')],
			});
			return;
		}

		await command.run(interaction);
	}
}
