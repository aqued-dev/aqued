import { PrismaClient } from '@prisma/client';
import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
const prisma = new PrismaClient();

export default class Ai implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('ai')
		.setDescription('実行したチャンネルで、Gemini AIを有効・無効化します');
	async run(interaction: ChatInputCommandInteraction) {
		const data = await prisma.ai.findMany({
			where: {
				OR: [{ channelId: interaction.channelId }],
			},
		});
		if (data.length === 0) {
			await prisma.ai.create({ data: { channelId: interaction.channelId } });
			await interaction.reply({
				embeds: [
					new EmbedBuilder().setAuthor({
						name: '登録しました',
						iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
					}).setColor(Colors.Blue),
				],
			});
		} else {
			await prisma.ai.deleteMany({ where: { channelId: interaction.channelId } });
			await interaction.reply({
				embeds: [
					new EmbedBuilder().setAuthor({
						name: '登録解除しました',
						iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
					}).setColor(Colors.Blue),
				],
			});
		}
	}
}
