/* eslint-disable no-case-declarations */
import {
	APISelectMenuOption,
	ActionRowBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SelectMenuComponentOptionData,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { EnkaClient } from 'enka-network-api';
export default {
	command: new SlashCommandBuilder()
		.setName('build')
		.setDescription('Artifacter')
		.addStringOption((input) =>
			input.setName('uid').setDescription('キャラクターのデータを取得するプレイヤーの UID').setRequired(true),
		)
		.addStringOption((input) =>
			input
				.setName('計算方法')
				.setDescription('計算方法')
				.addChoices(
					{ name: 'HP', value: 'HP' },
					{ name: 'ATTACK', value: 'ATTACK' },
					{ name: 'CHARGE', value: 'CHARGE' },
					{
						name: 'ELEMENT',
						value: 'ELEMENT',
					},
				)
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();
			const database = interaction.client.botData.artifacter;
			let first = '';
			const enka = new EnkaClient();
			enka
				.fetchUser(interaction.options.getString('uid'))
				.then(async (user) => {
					const list: Array<StringSelectMenuOptionBuilder | SelectMenuComponentOptionData | APISelectMenuOption> = [];
					for (const [index, v] of user.charactersPreview.entries()) {
						if (index === 0) first = v.characterData.name.get('jp');

						list.push({
							label: v.characterData.name.get('jp'),
							description: v.characterData.name.get('jp'),
							value: v.characterData.name.get('jp'),
						});
					}
					if (!first) {
						return await interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTitle('<:x_:1061166079495389196> | 失敗')
									.setDescription('キャラクターが見つかりませんでした。')
									.setColor('Blue'),
							],
						});
					}
					await database.set(interaction.options.getString('uid'), interaction.options.getString('計算方法'));
					await interaction.editReply({
						embeds: [new EmbedBuilder().setTitle('キャラクターを選択してください').setColor('Blue')],
						components: [
							new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
								new StringSelectMenuBuilder()
									.setCustomId('select_build1_uid_' + interaction.options.getString('uid'))
									.setPlaceholder('キャラクターを選択してください。')
									.setMaxValues(1)
									.addOptions(list),
							),
						],
					});
				})
				.catch(async () => {
					return await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setTitle('<:x_:1061166079495389196> | 失敗')
								.setDescription('エラーが発生しました。')
								.setColor('Blue'),
						],
					});
				});
		} catch (error) {
			console.log(error);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle('<:x_:1061166079495389196> | 失敗')
						.setDescription('ユーザーの取得に失敗しました。')
						.setColor('Blue'),
				],
			});
		}
	},
};
