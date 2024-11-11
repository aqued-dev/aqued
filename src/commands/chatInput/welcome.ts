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
			'ユーザー名: {{user.name}}',
			'フォーマット済みユーザー名: {{user.format_name}}',
			'ユーザーメンション: {{user.mention}}',
			'メンバー数: {{member.count}}'
		];
		const welcomeButton = new ButtonBuilder()
			.setLabel('入室メッセージ')
			.setCustomId(`chatinput_button_welcome_id_${interaction.user.id}`)
			.setStyle(ButtonStyle.Primary);
		const leaveButton = new ButtonBuilder()
			.setLabel('退出メッセージ')
			.setCustomId(`chatinput_button_leave_id_${interaction.user.id}`)
			.setStyle(ButtonStyle.Danger);
		await interaction.reply({
			embeds: [infoEmbed(texts.join('\n'), 'アクセサリー').setFooter({ text: 'Aqued App Language v0.1.0' })],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(welcomeButton, leaveButton)]
		});
	}
}
