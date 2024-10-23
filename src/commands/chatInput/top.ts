import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';
import { inspect } from 'util';
import { Logger } from '../../core/Logger.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed } from '../../embeds/infosEmbed.js';

export default class Top implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('top')
			.setDescription('チャンネルの一番上のメッセージへのリンクを表示します')
			.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
			.setContexts(InteractionContextType.Guild);
		this.settings = { enable: true, guildOnly: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		try {
			if (!interaction.channel) return;
			const messages = await interaction.channel.messages.fetch({ after: '0', limit: 1 });
			const message = messages.first();
			if (message) {
				await interaction.reply({
					embeds: [infoEmbed(`[**一番上のメッセージへジャンプ！**](${message.url})`)]
				});
			} else {
				await interaction.reply({
					embeds: [failEmbed('メッセージの取得に失敗しました')]
				});
			}
		} catch (error) {
			Logger.error(inspect(error));
			await interaction.reply({
				embeds: [failEmbed('メッセージの取得に失敗しました')]
			});
		}
	}
}
