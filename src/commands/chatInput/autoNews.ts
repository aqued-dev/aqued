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
			.setName('auto_news')
			.setDescription('ニュースチャンネルの内容を自動的に公開の有効化・無効化');
		this.settings = {
			enable: true,
			permissions: [PermissionFlagsBits.ManageMessages],
			channelTypes: [ChannelType.GuildAnnouncement]
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const settings = new SettingManager({ channelId: interaction.channelId });
		const setting = (await settings.getChannel()) ?? new ChannelSetting(interaction.channelId);
		if (setting.autoNews) {
			await settings.updateChannel({ autoNews: false });
			await interaction.reply({
				embeds: [disableEmbed('ニュース自動公開')]
			});
		} else {
			await settings.updateChannel({ autoNews: true });
			await interaction.reply({
				embeds: [enableEmbed('ニュース自動公開')]
			});
		}
	}
}
