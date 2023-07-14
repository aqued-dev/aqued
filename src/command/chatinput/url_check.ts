import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
export default {
	command: new SlashCommandBuilder()
		.setName('url_check')
		.setDescription('URLの安全性を確認します。')
		.addStringOption((input) => input.setName('url').setDescription('確認したいurl').setRequired(true)),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const url = interaction.options.getString('url');
		fetch(`https://safeweb.norton.com/report/show?url=${encodeURI(url)}&ulang=jpn`).then(async (value) => {
			if (!value.ok)
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('❌ 確認失敗')
							.setDescription('安全性の確認に失敗しました。')
							.setColor(Colors.Red),
					],
				});
			const data: string = await value.text();
			if (data.includes('安全性')) {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('このサイトは安全です')
							.setDescription(`ノートン セーフウェブが分析して安全性とセキュリティの問題を調べました。`)
							.setColor(Colors.Green)

							.setFooter({ text: 'Powered by Norton Safeweb' }),
					],
				});
			} else if (data.includes('［注意］')) {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('このサイトは注意が必要です')
							.setDescription(
								`注意の評価を受けた Web サイトは少数の脅威または迷惑を伴いますが、赤色の警告に相当するほど危険とは見なされません。サイトにアクセスする場合には注意が必要です。`,
							)
							.setColor(Colors.Yellow)
							.setFooter({ text: 'Powered by Norton Safeweb' }),
					],
				});
			} else if (data.includes('警告')) {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('このサイトは危険です')
							.setDescription(`これは既知の危険な Web ページです。このページを表示**しない**ことを推奨します。`)
							.setColor(Colors.Red)
							.setFooter({ text: 'Powered by Norton Safeweb' }),
					],
				});
			} else {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle('このサイトは未評価です')
							.setDescription(`このサイトはまだ評価されていません。`)
							.setColor(Colors.Grey)
							.setFooter({ text: 'Powered by Norton Safeweb' }),
					],
				});
			}
		});
	},
};
