import {
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	MessageFlags
} from 'discord.js';
import { Logger } from '../../../core/Logger.js';
import { type CommandSetting } from '../../../core/types/CommandSetting.js';
import type { MessageContextMenuCommand } from '../../../core/types/ContextCommand.js';
import { failEmbed, infoEmbed, successEmbed, warnEmbed } from '../../../embeds/infosEmbed.js';

export default class UrlCheck implements MessageContextMenuCommand {
	public command: ContextMenuCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new ContextMenuCommandBuilder()
			.setName('URL チェッカー')
			.setType(3)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: MessageContextMenuCommandInteraction) {
		if (!interaction.targetMessage.cleanContent) {
			return await interaction.reply({
				embeds: [failEmbed('メッセージの内容がありません')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		const urls = interaction.targetMessage.cleanContent.match(/(https?:\/\/[^\s]+)/g);
		if (!urls || urls.length === 0) {
			return await interaction.reply({
				embeds: [failEmbed('メッセージ内にURLがありません')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		await interaction.deferReply();
		const embeds: EmbedBuilder[] = [infoEmbed(`${urls.length} 個のURLをチェックしました`)];
		for (const url of urls) {
			try {
				const response = await fetch(
					`https://safeweb.norton.com/safeweb/sites/v1/details?url=${encodeURI(url)}&insert=0`
				);
				if (!response.ok) {
					embeds.push(failEmbed('安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb'));
					continue;
				}

				const data = (await response.json()) as Record<string, unknown>;

				if (!data['rating']) {
					embeds.push(infoEmbed('このサイトは不明です', undefined, '不明', 'Powered by Norton Safeweb'));
				} else if (data['rating'] === 'r' || data['rating'] === 'g') {
					embeds.push(
						successEmbed(
							'ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました',
							'このサイトは安全です',
							undefined,
							'Powered by Norton Safeweb'
						)
					);
				} else if (data['rating'] === 'w') {
					embeds.push(
						warnEmbed(
							'注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、\n赤色の警告に相当するほど危険とは見なされません\nサイトにアクセスする場合には注意が必要です',
							'このサイトは注意が必要です',
							undefined,
							'Powered by Norton Safeweb'
						)
					);
				} else if (data['rating'] === 'b') {
					embeds.push(
						failEmbed(
							'これは既知の危険な Web ページです\nこのページを表示**しない**ことを推奨します',
							'このサイトは危険です',
							undefined,
							'Powered by Norton Safeweb'
						)
					);
				} else if (data['rating'] === 'u') {
					embeds.push(
						infoEmbed(
							'このサイトはまだ評価されていません',
							'このサイトは未評価です',
							undefined,
							'Powered by Norton Safeweb'
						)
					);
				}
			} catch (error) {
				Logger.error(error);
				embeds.push(failEmbed('安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb'));
			}
		}
		await interaction.editReply({ embeds });
		return;
	}
}
