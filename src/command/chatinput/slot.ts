import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { setTimeout } from 'node:timers/promises';
export default {
	command: new SlashCommandBuilder()
		.setName('slot')
		.setDescription('スロットができます。')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.MentionEveryone],
	async execute(interaction: ChatInputCommandInteraction) {
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
			'🍓',
		];

		const random = Math.floor(Math.random() * array.length);
		const result = array[random];
		const random2 = Math.floor(Math.random() * array.length);
		const result2 = array[random2];
		const random3 = Math.floor(Math.random() * array.length);
		const result3 = array[random3];
		await interaction.reply(result! + result2 + result3);
		let x = 0;
		while (x < 10) {
			x++;
			await setTimeout(1000);
			const random = Math.floor(Math.random() * array.length);
			const result = array[random];
			const random2 = Math.floor(Math.random() * array.length);
			const result2 = array[random2];
			const random3 = Math.floor(Math.random() * array.length);
			const result3 = array[random3];
			await interaction.editReply(result! + result2 + result3);
			if (x == 10) {
				await (result === result2 && result2 === result3
					? interaction.followUp('あなたは勝利しました。')
					: interaction.followUp('あなたは負けました。'));
			}
		}
	},
};
