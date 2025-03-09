import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
export function embed(type: string, message?: string, title?: string, customTitle?: string, footer?: string) {
	const embed = new EmbedBuilder();
	embed.setAuthor({ name: customTitle ?? type, iconURL: 'https://cdn.discordapp.com/emojis/1298214751645601792.png' });
	if (message) {
		embed.setDescription(message);
	}
	if (title) {
		embed.setTitle(title);
	}
	let color: number = Colors.Blue;
	if (type === '失敗' || type === '削除') {
		color = Colors.Red;
	} else if (type === '成功') {
		color = Colors.Green;
	} else if (type === '注意') {
		color = Colors.Yellow;
	} else if (type === '返信') {
		color = Colors.Orange;
	}
	embed.setColor(color);
	embed.setFooter({ text: footer ?? 'Aqued' });
	embed.setTimestamp();

	return embed;
}
export default {
	command: new SlashCommandBuilder()
		.setName('url_check')
		.setDescription('URLの安全性を確認します。')
		.addStringOption((input) => input.setName('url').setDescription('確認したいurl').setRequired(true))
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const url = interaction.options.getString('url') ?? '';
		fetch(`https://safeweb.norton.com/safeweb/sites/v1/details?url=${encodeURI(url)}&insert=0`).then(
			async (response) => {
				if (!response.ok) {
					return await interaction.editReply({
						embeds: [embed('失敗', '安全性の確認に失敗しました', undefined, undefined, 'Powered by Norton Safeweb')],
					});
				}
				const data = (await response.json()) as Record<string, string>;
				if (!data['rating']) {
					return await interaction.editReply({
						embeds: [embed('情報', 'このサイトは不明です', undefined, '不明', 'Powered by Norton Safeweb')],
					});
				}
				if (data['rating'] === 'r' || data['rating'] === 'g') {
					return await interaction.editReply({
						embeds: [
							embed(
								'成功',
								'ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました',
								'このサイトは安全です',
								undefined,
								'Powered by Norton Safeweb',
							),
						],
					});
				}
				if (data['rating'] === 'w') {
					return await interaction.editReply({
						embeds: [
							embed(
								'注意',
								'注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、\n赤色の警告に相当するほど危険とは見なされません\nサイトにアクセスする場合には注意が必要です',
								'このサイトは注意が必要です',
								undefined,
								'Powered by Norton Safeweb',
							),
						],
					});
				}
				if (data['rating'] === 'b') {
					return await interaction.editReply({
						embeds: [
							embed(
								'失敗',
								'これは既知の危険な Web ページです\nこのページを表示**しない**ことを推奨します',
								'このサイトは危険です',
								undefined,
								'Powered by Norton Safeweb',
							),
						],
					});
				}
				if (data['rating'] === 'u') {
					return await interaction.editReply({
						embeds: [
							embed(
								'情報',
								'このサイトはまだ評価されていません',
								'このサイトは未評価です',
								undefined,
								'Powered by Norton Safeweb',
							),
						],
					});
				}
				return;
			},
		);
	},
};
