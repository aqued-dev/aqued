import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder
} from 'discord.js';
import { emojis } from '../../config/emojis.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';
import { TextBasedChannelTypes } from '../../utils/TextBasedChannelType.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class MessageExpander implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('message_expander')
			.setDescription('メッセージリンクからメッセージの内容を展開する機能の設定');
		this.settings = {
			enable: true,
			permissions: [PermissionFlagsBits.ManageMessages],
			channelTypes: TextBasedChannelTypes
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const emoji = emojis();
		const embed = infoEmbed('メッセージ展開操作パネル');
		const setting = new ButtonBuilder()
			.setCustomId(generateCustomId('chatinput', 'button', 'message_expander', 'setting'))
			.setLabel('設定')
			.setEmoji(emoji.setting)
			.setStyle(ButtonStyle.Primary);
		const view = new ButtonBuilder()
			.setCustomId(generateCustomId('chatinput', 'button', 'message_expander', 'view'))
			.setLabel('確認')
			.setEmoji(emoji.info)
			.setStyle(ButtonStyle.Success);
		return await interaction.reply({
			embeds: [embed],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(setting, view)]
		});
	}
}
