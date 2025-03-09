import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { embed } from '../chatinput/url_check.js';

export default {
	command: new ContextMenuCommandBuilder()
		.setName('URLチェッカー')
		.setType(ApplicationCommandType.Message)
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: MessageContextMenuCommandInteraction) {
		if (!interaction.targetMessage.cleanContent) {
			return await interaction.error('エラー', 'メッセージの内容がありません', true);
		}
		const urls = interaction.targetMessage.cleanContent.match(/(https?:\/\/[^\s]+)/g);
		if (!urls || urls.length === 0) {
			return await interaction.error('エラー', 'URLがありません', true);
		}

		await interaction.deferReply();

		const returnEmbeds = urls.map(async (url) => {
			const response = await fetch(
				`https://safeweb.norton.com/safeweb/sites/v1/details?url=${encodeURI(url)}&insert=0`,
			);
			if (!response.ok) {
				return embed('失敗', '安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb');
			}
			const data = (await response.json()) as Record<string, string>;
			if (!data['rating']) {
				return embed('失敗', '安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb');
			}
			if (data['rating'] === 'r' || data['rating'] === 'g') {
				return embed(
					'成功',
					'ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました',
					'このサイトは安全です',
					undefined,
					'Powered by Norton Safeweb',
				);
			}
			if (data['rating'] === 'w') {
				return embed(
					'注意',
					'注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、\n赤色の警告に相当するほど危険とは見なされません\nサイトにアクセスする場合には注意が必要です',
					'このサイトは注意が必要です',
					undefined,
					'Powered by Norton Safeweb',
				);
			}
			if (data['rating'] === 'b') {
				return embed(
					'失敗',
					'これは既知の危険な Web ページです\nこのページを表示**しない**ことを推奨します',
					'このサイトは危険です',
					undefined,
					'Powered by Norton Safeweb',
				);
			}
			if (data['rating'] === 'u') {
				return embed(
					'情報',
					'このサイトはまだ評価されていません',
					'このサイトは未評価です',
					undefined,
					'Powered by Norton Safeweb',
				);
			}
			return embed('失敗', '安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb');
		});

		const embeds = await Promise.all(returnEmbeds);

		return await interaction.editReply({ embeds });
	},
};
