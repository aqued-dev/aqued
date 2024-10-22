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
		this.command = new SlashCommandBuilder().setName('globalchat').setDescription('グローバルチャット');
		this.settings = {
			enable: true,
			permissions: [PermissionFlagsBits.ManageChannels],
			channelTypes: [
				ChannelType.GuildText,
				ChannelType.GuildVoice,
				ChannelType.GuildAnnouncement,
				ChannelType.AnnouncementThread,
			],
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const settings = new SettingManager({ channelId: interaction.channelId });
		const setting = (await settings.getChannel()) ?? new ChannelSetting(interaction.channelId);
		if (setting.globalChat) {
			await settings.updateChannel({ globalChat: false });
			await interaction.reply({
				embeds: [disableEmbed('グローバルチャット')],
			});
		} else {
			await settings.updateChannel({ globalChat: true });
			await interaction.reply({
				embeds: [enableEmbed('グローバルチャット')],
			});
		}
	}
}
