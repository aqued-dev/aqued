import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
	command: new SlashCommandBuilder().setName('embed').setDescription('embedを生成します。'),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.options.getString('title') || 'タイトル')
					.setDescription(interaction.options.getString('description') || '説明')
					.setColor(Colors.Default),
			],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder('embedの編集...')
						.setCustomId('embed_edit_select')
						.setMaxValues(1)
						.addOptions(
							{ label: 'タイトル', description: interaction.options.getString('title') || 'タイトル', value: 'title' },
							{
								label: '説明',
								description: interaction.options.getString('description') || '説明',
								value: 'description',
							},
							{ label: 'url', description: 'なし', value: 'url' },
							{ label: '色', description: '#000000(黒)', value: 'color' },
							{ label: 'フッター', description: 'なし', value: 'footer' },
							{ label: '画像', description: 'なし', value: 'image' },
							{ label: 'サムネイル', description: 'なし', value: 'thumbnail' },
							{ label: '著者', description: 'なし', value: 'author' },
						),
				),
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder('フィールドの編集...')
						.setCustomId('embed_fields_edit_select')
						.setMaxValues(1)
						.addOptions(
							{
								label: 'フィールド1',
								description: 'なし',
								value: 'field1',
							},
							{
								label: 'フィールド2',
								description: 'なし',
								value: 'field2',
							},
							{
								label: 'フィールド3',
								description: 'なし',
								value: 'field3',
							},
							{
								label: 'フィールド4',
								description: 'なし',
								value: 'field4',
							},
							{
								label: 'フィールド5',
								description: 'なし',
								value: 'field5',
							},
							{
								label: 'フィールド6',
								description: 'なし',
								value: 'field6',
							},
							{
								label: 'フィールド7',
								description: 'なし',
								value: 'field7',
							},
							{
								label: 'フィールド8',
								description: 'なし',
								value: 'field8',
							},
							{
								label: 'フィールド9',
								description: 'なし',
								value: 'field9',
							},
							{
								label: 'フィールド10',
								description: 'なし',
								value: 'field10',
							},
							{
								label: 'フィールド11',
								description: 'なし',
								value: 'field11',
							},
							{
								label: 'フィールド12',
								description: 'なし',
								value: 'field12',
							},
							{
								label: 'フィールド13',
								description: 'なし',
								value: 'field13',
							},
							{
								label: 'フィールド14',
								description: 'なし',
								value: 'field14',
							},
							{
								label: 'フィールド15',
								description: 'なし',
								value: 'field15',
							},
							{
								label: 'フィールド16',
								description: 'なし',
								value: 'field16',
							},
							{
								label: 'フィールド17',
								description: 'なし',
								value: 'field17',
							},
							{
								label: 'フィールド18',
								description: 'なし',
								value: 'field18',
							},
							{
								label: 'フィールド19',
								description: 'なし',
								value: 'field19',
							},
							{
								label: 'フィールド20',
								description: 'なし',
								value: 'field20',
							},
							{
								label: 'フィールド21',
								description: 'なし',
								value: 'field21',
							},
							{
								label: 'フィールド22',
								description: 'なし',
								value: 'field22',
							},
							{
								label: 'フィールド23',
								description: 'なし',
								value: 'field23',
							},
							{
								label: 'フィールド24',
								description: 'なし',
								value: 'field24',
							},
							{
								label: 'フィールド25',
								description: 'なし',
								value: 'field25',
							},
						),
				),
			],
		});
	},
};
