import { PrismaClient } from '@prisma/client';
import { SlashCommandClass } from '../../lib/bot/index.js';
import {ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
const prisma = new PrismaClient();

export default class AFK implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('afk')
		.setDescription('AFKを有効・無効化します')
		.addStringOption((input) => input.setName('reason').setDescription('理由').setRequired(false));
	async run(interaction: ChatInputCommandInteraction) {
		const data = await prisma.afk.findMany({
			where: {
				OR: [{ userId: interaction.user.id }],
			},
		});
		if (data.length === 0) {
			const reason = interaction.options.getString('reason');
			if (reason) await prisma.afk.create({ data: { userId: interaction.user.id, reason } });
			else await prisma.afk.create({ data: { userId: interaction.user.id } });

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: '登録しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						})
						.setColor(Colors.Blue),
				],
			});
		} else {
			await prisma.afk.deleteMany({ where: { userId: interaction.user.id } });
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setAuthor({
							name: '解除しました',
							iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
						})
						.setColor(Colors.Blue),
				],
			});
		}
	}
}
