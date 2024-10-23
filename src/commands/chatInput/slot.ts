import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed, successEmbed } from '../../embeds/infosEmbed.js';

export default class Slot implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('slot')
			.setDescription('スロットができます。')
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	getEmoji() {
		const array = [
			'🍏',
			'🍎',
			'🍐',
			'🍊',
			'🍋',
			'🍉',
			'🍇',
			'🫐',
			'🍅',
			'🥝',
			'🍍',
			'🍒',
			'🍈',
			'🍓',
			'🍏',
			'🍎',
			'🍐',
			'🍊',
			'🍋',
			'🍉',
			'🍇',
			'🫐',
			'🍅',
			'🥝',
			'🍍',
			'🍒',
			'🍈',
			'🍓'
		];

		const randomFruit = () => array[Math.floor(Math.random() * array.length)] ?? '';
		return randomFruit() + randomFruit() + randomFruit();
	}

	async run(interaction: ChatInputCommandInteraction) {
		let x = 0;
		await interaction.reply({ embeds: [infoEmbed(this.getEmoji(), 'スロット')] });
		while (x < 10) {
			x++;
			await setTimeout(1000);
			const emoji = this.getEmoji();
			const [one, two, three] = emoji;
			await interaction.editReply({ embeds: [infoEmbed(emoji, 'スロット')] });
			if (x == 10) {
				if (one === two && two === three) {
					await interaction.editReply({
						embeds: [successEmbed('優勝しました！おめでとうございます', 'スロット', '勝利')]
					});
				} else {
					await interaction.editReply({
						embeds: [failEmbed('残念ながら今回は負けました...\nまたのご挑戦をお待ちしております', 'スロット', '負け')]
					});
				}
			}
		}
	}
}
