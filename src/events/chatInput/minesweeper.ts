import { BaseInteraction, Events } from 'discord.js';
import Minesweeper from '../../commands/chatInput/minesweeper.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';

export default class MinesweeperRegenerate implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isButton()) {
			return;
		}
		if (interaction.customId !== 'chatInput_button_minesweeper_regenerate') {
			return;
		}

		const minesweeper = new Minesweeper();

		await interaction.update({
			embeds: [infoEmbed('再生成中です', 'マインスイーパ')]
		});

		return await interaction.editReply({
			embeds: [infoEmbed(minesweeper.generate(9, 9, 10), 'マインスイーパ')]
		});
	}
}
