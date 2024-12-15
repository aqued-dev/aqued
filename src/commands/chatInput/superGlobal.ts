import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SettingManager } from '../../core/SettingManager.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { disableEmbed, enableEmbed } from '../../embeds/booleanEmbed.js';

export default class GlobalChat implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('superglobalchat')
			.setDescription('[使用不可] スーパーグローバルチャットの有効化・無効化');
		this.settings = {
			enable: false, // 機能完成まで封鎖
			adminOnly: true,
			permissions: [PermissionFlagsBits.ManageChannels],
			channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement]
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const settings = new SettingManager({ channelId: interaction.channelId });
		const setting = (await settings.getChannel()) ?? new ChannelSetting(interaction.channelId);
		if (setting.superGlobal) {
			await settings.updateChannel({ superGlobal: false });
			await interaction.reply({
				embeds: [disableEmbed('スーパーグローバルチャット')]
			});
		} else {
			await settings.updateChannel({ superGlobal: true });
			await interaction.reply({
				embeds: [enableEmbed('スーパーグローバルチャット')]
			});
		}
	}
}
