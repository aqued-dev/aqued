import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

export default {
	command: new SlashCommandBuilder()
		.setName('server_up_notice')
		.setDescription('サーバーUP(ディス速、ディスボード)の通知の設定ができます。')
		.setGuildOnly()
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.MentionEveryone],
	async execute(interaction: ChatInputCommandInteraction) {
		const message = await interaction.reply({
			fetchReply: true,
			embeds: [
				new EmbedBuilder()
					.setTitle('サーバーUP通知設定')
					.setDescription('下のボタンを押してそのbotのサーバーUPの通知設定ができます')
					.setColor(Colors.Blue),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setLabel('ディス速').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_1'),
					new ButtonBuilder().setLabel('DISBOARD').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_2'),
				),
			],
		});
		await interaction.client.botData.commandExecutors.serverUpNotice.set(message.id, interaction.user.id);
	},
};
