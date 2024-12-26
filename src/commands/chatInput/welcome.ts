import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class Welcome implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('welcome_message')
			.setDescription('ユーザーが参加・退出した時に送信するメッセージを設定します')
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild]);
		this.settings = { enable: true, guildOnly: true, permissions: [PermissionFlagsBits.ManageWebhooks] };
	}
	async run(interaction: ChatInputCommandInteraction) {
		const texts = [
			'サーバー名などをウェルカムメッセージに入れることができます',
			'サーバー名: {{server.name}}',
			'ユーザー名: {{member.name}}',
			'フォーマット済みユーザー名: {{member.format_name}}',
			'ユーザーメンション: {{user.mention}}',
			'メンバー数: {{server.member.count}}'
		];
		const welcomeButton = new ButtonBuilder()
			.setLabel('入室メッセージ')
			.setCustomId(generateCustomId('chatinput', 'button', 'welcome', 'id', interaction.user.id))
			.setStyle(ButtonStyle.Primary);
		const leaveButton = new ButtonBuilder()
			.setLabel('退出メッセージ')
			.setCustomId(generateCustomId('chatinput', 'button', 'leave', 'id', interaction.user.id))
			.setStyle(ButtonStyle.Primary);
		const deleteWelcome = new ButtonBuilder()
			.setLabel('入室メッセージ解除')
			.setCustomId(generateCustomId('chatinput', 'button', 'welcome', 'delete', 'id', interaction.user.id))
			.setStyle(ButtonStyle.Danger);
		const deleteLeave = new ButtonBuilder()
			.setLabel('退出メッセージ解除')
			.setCustomId(generateCustomId('chatinput', 'button', 'leave', 'delete', 'id', interaction.user.id))
			.setStyle(ButtonStyle.Danger);
		await interaction.reply({
			embeds: [infoEmbed(texts.join('\n'), 'アクセサリー').setFooter({ text: 'Aqued App Language v0.1.0' })],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(welcomeButton, leaveButton, deleteWelcome, deleteLeave)
			]
		});
	}
}
