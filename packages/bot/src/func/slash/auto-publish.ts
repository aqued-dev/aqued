import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class AutoPublish implements SlashCommandClass {
	command = new SlashCommandBuilder()
		.setName('auto-publish')
		.setDescription('ニュースチャンネルでの、自動公開機能を有効・無効化します')
		.addChannelOption((input) =>
			input
				.addChannelTypes(ChannelType.GuildAnnouncement)
				.setName('channel')
				.setDescription('チャンネル')
				.setRequired(false),
		)
		.setDMPermission(false);
	async run(interaction: ChatInputCommandInteraction) {}
}
