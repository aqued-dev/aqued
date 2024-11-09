import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed, successEmbed, warnEmbed } from '../../embeds/infosEmbed.js';

export default class UrlCheck implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('url_check')
			.setDescription('URLの安全性を確認します')
			.addStringOption((input) => input.setName('url').setDescription('確認したいurl').setRequired(true))
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const url = interaction.options.getString('url') ?? '';
		fetch(`https://safeweb.norton.com/safeweb/sites/v1/details?url=${encodeURI(url)}&insert=0`).then(
			async (response) => {
				if (!response.ok) {
					return await interaction.editReply({
						embeds: [failEmbed('安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb')]
					});
				}
				const data = (await response.json()) as Record<string, string>;
				if (!data['rating']) {
					return await interaction.editReply({
						embeds: [infoEmbed('このサイトは不明です', undefined, '不明', 'Powered by Norton Safeweb')]
					});
				}
				if (data['rating'] === 'r' || data['rating'] === 'g') {
					return await interaction.editReply({
						embeds: [
							successEmbed(
								'ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました',
								'このサイトは安全です',
								undefined,
								'Powered by Norton Safeweb'
							)
						]
					});
				}
				if (data['rating'] === 'w') {
					return await interaction.editReply({
						embeds: [
							warnEmbed(
								'注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、\n赤色の警告に相当するほど危険とは見なされません\nサイトにアクセスする場合には注意が必要です',
								'このサイトは注意が必要です',
								undefined,
								'Powered by Norton Safeweb'
							)
						]
					});
				}
				if (data['rating'] === 'b') {
					return await interaction.editReply({
						embeds: [
							failEmbed(
								'これは既知の危険な Web ページです\nこのページを表示**しない**ことを推奨します',
								'このサイトは危険です',
								undefined,
								'Powered by Norton Safeweb'
							)
						]
					});
				}
				if (data['rating'] === 'u') {
					return await interaction.editReply({
						embeds: [
							infoEmbed(
								'このサイトはまだ評価されていません',
								'このサイトは未評価です',
								undefined,
								'Powered by Norton Safeweb'
							)
						]
					});
				}
				return;
			}
		);
	}
}
