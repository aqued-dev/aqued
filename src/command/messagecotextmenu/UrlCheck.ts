import { ApplicationCommandType, EmbedBuilder, MessageContextMenuCommandInteraction, Colors } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

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
		if (!interaction.targetMessage.cleanContent)
			return await interaction.error('エラー', 'メッセージの内容がありません', true);
		const urls = interaction.targetMessage.cleanContent.match(/(https?:\/\/[^\s]+)/g);
		if (!urls || urls.length === 0) return await interaction.error('エラー', 'URLがありません', true);

		await interaction.deferReply();

		const returnEmbeds = urls.map(async (url) => {
			try {
				const response = await fetch(
					`https://safeweb.norton.com/safeweb/sites/v1/details?url=${encodeURI(url)}&insert=0`,
				);
				if (!response.ok) {
					return new EmbedBuilder()
						.setTitle('❌ 確認失敗')
						.setDescription('安全性の確認に失敗しました。')
						.setColor(Colors.Red)
						.setAuthor({ name: url });
				}

				const data = await response.json();
				if (data['rating'] === 'r' || data['rating'] === 'g') {
					return new EmbedBuilder()
						.setTitle('このサイトは安全です')
						.setDescription('ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました。')
						.setColor(Colors.Green)
						.setAuthor({ name: url, url })
						.setFooter({ text: 'Powered by Norton Safeweb' });
				} else if (data['rating'] === 'w') {
					return new EmbedBuilder()
						.setTitle('このサイトは注意が必要です')
						.setDescription(
							'注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、赤色の警告に相当するほど危険とは見なされません。サイトにアクセスする場合には注意が必要です。',
						)
						.setColor(Colors.Yellow)
						.setAuthor({ name: url })
						.setFooter({ text: 'Powered by Norton Safeweb' });
				} else if (data['rating'] === 'b') {
					return new EmbedBuilder()
						.setTitle('このサイトは危険です')
						.setDescription('これは既知の危険な Web ページです。このページを表示**しない**ことを推奨します。')
						.setColor(Colors.Red)
						.setAuthor({ name: url })
						.setFooter({ text: 'Powered by Norton Safeweb' });
				} else if (data['rating'] === 'u') {
					return new EmbedBuilder()
						.setTitle('このサイトは未評価です')
						.setDescription('このサイトはまだ評価されていません。')
						.setColor(Colors.Grey)
						.setAuthor({ name: url })
						.setFooter({ text: 'Powered by Norton Safeweb' });
				} else {
					return new EmbedBuilder()
						.setTitle('このサイトは不明です')
						.setDescription('仕様変更等により確認ができませんでした。')
						.setColor(Colors.Grey)
						.setAuthor({ name: url })
						.setFooter({ text: 'Powered by Norton Safeweb' });
				}
			} catch {
				return new EmbedBuilder()
					.setTitle('❌ エラー')
					.setDescription('サイトの安全性を確認中にエラーが発生しました。')
					.setColor(Colors.Red)
					.setAuthor({ name: url });
			}
		});

		const embeds = await Promise.all(returnEmbeds);
		return await interaction.editReply({ embeds });
	},
};
