import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	DiscordAPIError,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';
import { fileURLToPath } from 'node:url';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed } from '../../embeds/infosEmbed.js';
import { errorReport } from '../../utils/errorReporter.js';

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
			if (!interaction.channel) {
				return;
			}
			const messages = await interaction.channel.messages.fetch({ after: '0', limit: 1 });
			const message = messages.first();
			if (message) {
				return await interaction.reply({
					embeds: [infoEmbed(`[**一番上のメッセージへジャンプ！**](${message.url})`)]
				});
			} else {
				return await interaction.reply({
					embeds: [failEmbed('メッセージの取得に失敗しました')]
				});
			}
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				return await interaction.reply({
					embeds: [failEmbed('(おそらく)メッセージの取得に失敗しました')]
				});
			} else {
				const errorId = await errorReport(
					fileURLToPath(import.meta.url),
					interaction.channel!,
					interaction.user,
					error,
					interaction.commandName
				);
				return await interaction.reply({
					embeds: [
						failEmbed(
							`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
						)
					],
					ephemeral: true
				});
			}
		}
	}
}
