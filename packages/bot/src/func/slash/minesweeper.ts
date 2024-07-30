import { SlashCommandClass } from '../../lib/bot/index.js';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { Minesweeper } from '../../lib/index.js';
const minesweeper = new Minesweeper();
export default class Ping implements SlashCommandClass {
	command = new SlashCommandBuilder().setName('minesweeper').setDescription('マインスイーパ');
	generate() {
		const select = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setLabel('再生成').setStyle(ButtonStyle.Success).setCustomId('minesweeper_button_regenerate'),
		);
		return { content: `# マインスイーパ\n${minesweeper.beginner()}`, components: [select] };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply(this.generate());
	}
	async button(interaction: ButtonInteraction) {
		if (interaction.customId !== 'minesweeper_button_regenerate') return;
		await interaction.update('生成中...⏳');
		await interaction.editReply(this.generate());
	}
}
