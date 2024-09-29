import { ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { inspect } from 'util';
import { Logger } from '../../core/Logger.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';

export default class Top implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('top')
			.setDescription('top!!!')
			.setContexts(InteractionContextType.Guild);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		try {
			if (!interaction.channel) return;
			const messages = await interaction.channel.messages.fetch({ after: '0', limit: 1 });
			const message = messages.first();
			if (message) {
				await interaction.reply({
					embeds: [new EmbedBuilder().setDescription(`[**一番上のメッセージへジャンプ！**](${message.url})`)],
				});
			} else {
				await interaction.reply({
					embeds: [new EmbedBuilder().setAuthor({ name: 'メッセージの取得に失敗' })],
				});
			}
		} catch (error) {
			Logger.error(inspect(error));
			await interaction.reply({
				embeds: [new EmbedBuilder().setAuthor({ name: 'メッセージの取得に失敗' })],
			});
		}
	}
}
