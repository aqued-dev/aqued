import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';
import { Logger } from '../../core/Logger.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class Minesweeper implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('minesweeper')
			.setDescription('マインスイーパがプレイできます')
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	public generate(rows: number, cols: number, mines: number): string {
		const board: (number | '💣')[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

		const isValidPosition = (r: number, c: number): boolean => {
			return r >= 0 && r < rows && c >= 0 && c < cols;
		};

		let placedMines = 0;
		while (placedMines < mines) {
			const row = Math.floor(Math.random() * rows);
			const col = Math.floor(Math.random() * cols);

			if (typeof board[row] === 'undefined') {
				Logger.error('row is out of range.');
				continue;
			}

			if (board[row][col] === '💣') {
				continue;
			}

			board[row][col] = '💣';
			placedMines++;

			for (let rOffset = -1; rOffset <= 1; rOffset++) {
				for (let cOffset = -1; cOffset <= 1; cOffset++) {
					const newRow = row + rOffset;
					const newCol = col + cOffset;

					if (
						isValidPosition(newRow, newCol) &&
						typeof board[newRow] !== 'undefined' &&
						board[newRow][newCol] !== '💣'
					) {
						board[newRow][newCol] = (board[newRow][newCol] as number) + 1;
					}
				}
			}
		}
		const numberToEmoji: { [key: string | number]: string } = {
			0: '||0⃣|| ',
			1: '||1⃣|| ',
			2: '||2⃣|| ',
			3: '||3⃣|| ',
			4: '||4⃣|| ',
			5: '||5⃣|| ',
			6: '||6⃣|| ',
			7: '||7⃣|| ',
			8: '||8⃣|| ',
			9: '||9⃣|| ',
			'💣': '||💣|| '
		};
		return board.map((row) => row.map((value) => numberToEmoji[value]).join('')).join('\n');
	}

	async run(interaction: ChatInputCommandInteraction) {
		const button = new ButtonBuilder()
			.setLabel('再生成')
			.setStyle(ButtonStyle.Success)
			.setCustomId(generateCustomId('chatinput', 'button', 'minesweeper', 'regenerate'));

		await interaction.reply({
			embeds: [infoEmbed(this.generate(9, 9, 10), 'マインスイーパ')],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
		});
	}
}
