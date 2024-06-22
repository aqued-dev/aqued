import { PrismaClient } from '@prisma/client';
import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
const prisma = new PrismaClient();

export default class EarthQuake implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('earthquake')
		.setDescription('地震系コマンド')
		.addSubcommand((input) =>
			input
				.setName('alert')
				.setDescription('地震速報を有効・無効にします')
				.addChannelOption((input) =>
					input.setName('受信するチャンネル').setDescription('地震速報を受信するチャンネルを選択してください'),
				),
		);
	async run(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getSubcommand() === 'alert') {
			const channelId = interaction.options.getChannel('受信するチャンネル')
				? interaction.options.getChannel('受信するチャンネル').id
				: interaction.channelId;
			const data = await prisma.earthQuakeAlert.findMany({
				where: {
					OR: [{ channelId }],
				},
			});
			if (data.length === 0) {
				await prisma.earthQuakeAlert.create({ data: { channelId } });
				await interaction.reply({
					embeds: [
						new EmbedBuilder().setAuthor({
							name: '登録しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						}).setColor(Colors.Blue),
					],
				});
			} else {
				await prisma.earthQuakeAlert.deleteMany({ where: { channelId } });
				await interaction.reply({
					embeds: [
						new EmbedBuilder().setColor(Colors.Blue).setAuthor({
							name: '登録解除しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						}),
					],
				});
			}
		}
	}
}
