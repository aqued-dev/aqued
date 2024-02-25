import { PrismaClient } from '@prisma/client';
import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
const prisma = new PrismaClient();

export default class Ping implements SlashCommandClass {
	command = new SlashCommandBuilder().setName('ai').setDescription('実行したチャンネルで、Gemini AIを有効化します。');
	async run(interaction: ChatInputCommandInteraction) {
		const data = await prisma.ai
			.findMany({
				where: {
					OR: [{ channelId: interaction.channelId }],
				},
			})
		if (data.length === 0) {
			await prisma.ai.create({ data: { channelId: interaction.channelId } });
			await interaction.reply('登録しました。');
		} else {
			await prisma.ai.deleteMany({ where: { channelId: interaction.channelId } });
			await interaction.reply('登録解除しました。');
		}
	}
}
