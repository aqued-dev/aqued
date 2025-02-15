import {
	ActionRowBuilder,
	BaseInteraction,
	EmbedBuilder,
	EmbedFooterOptions,
	Events,
	MessageFlags,
	ModalSubmitInteraction,
	StringSelectMenuBuilder
} from 'discord.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { failEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class EmbedEdit implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async edit(embed: EmbedBuilder, interaction: ModalSubmitInteraction) {
		if (!interaction.message) {
			return;
		}
		await interaction.message.edit({ embeds: [embed], components: [] });
		await interaction.message.edit({
			embeds: [embed],
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setPlaceholder('embedの編集...')
						.setCustomId(generateCustomId('chatinput', 'select', 'embed', 'edit'))
						.setMaxValues(1)
						.addOptions(
							{
								label: 'タイトル',
								description: embed.data.title || 'なし',
								value: 'title'
							},
							{
								label: '説明',
								description: embed.data.description || 'なし',
								value: 'description'
							},
							{ label: 'url', description: embed.data.url || 'なし', value: 'url' },
							{
								label: '色',
								description: embed.data.color ? '#' + embed.data.color.toString(16).padStart(2, '0') : '#000000',
								value: 'color'
							},
							{ label: 'フッター', description: embed.data.footer ? embed.data.footer.text : 'なし', value: 'footer' },
							{ label: '画像', description: embed.data.image ? embed.data.image.url : 'なし', value: 'image' },
							{
								label: 'サムネイル',
								description: embed.data.thumbnail ? embed.data.thumbnail.url : 'なし',
								value: 'thumbnail'
							},
							{ label: '著者', description: embed.data.author ? embed.data.author.name : 'なし', value: 'author' }
						)
				)
			]
		});
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isModalSubmit()) {
			return;
		}
		switch (interaction.customId) {
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'title'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				embed.setTitle(interaction.fields.getTextInputValue('title'));
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'description'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				embed.setDescription(interaction.fields.getTextInputValue('description'));
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'url'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				embed.setURL(interaction.fields.getTextInputValue('url'));
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'color'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				const color = /^#([\dA-Fa-f]{6})$/.test(interaction.fields.getTextInputValue('color'));
				if (color) {
					embed.setColor(`#${interaction.fields.getTextInputValue('color').replaceAll('#', '')}`);
					await this.edit(embed, interaction);
					return await interaction.deferUpdate();
				} else {
					return await interaction.reply({
						embeds: [failEmbed('正しい16進数カラーコード(6桁)を入力してください')],
						flags: [MessageFlags.Ephemeral]
					});
				}
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'footer'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				const text = interaction.fields.getTextInputValue('text');
				const icon = interaction.fields.getTextInputValue('icon');
				if (!text && !icon) {
					return await interaction.deferUpdate();
				} else {
					const data: EmbedFooterOptions = {
						text: ''
					};
					if (text) {
						data['text'] = text;
					}
					if (icon) {
						data['iconURL'] = icon;
					}
					try {
						embed.setFooter(data);
					} catch {
						await interaction.reply({
							embeds: [failEmbed('フッターのアイコンURLが正しくありません')],
							flags: [MessageFlags.Ephemeral]
						});
					}
					await this.edit(embed, interaction);
					return await interaction.deferUpdate();
				}
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'image'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				const image = interaction.fields.getTextInputValue('image');
				try {
					embed.setImage(image);
				} catch {
					await interaction.reply({
						embeds: [failEmbed('画像URLが正しくありません')],
						flags: [MessageFlags.Ephemeral]
					});
				}
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'thumbnail'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				const thumbnailUrl = interaction.fields.getTextInputValue('thumbnailurl');
				try {
					embed.setThumbnail(thumbnailUrl);
				} catch {
					await interaction.reply({
						embeds: [failEmbed('サムネイルURLが正しくありません')],
						flags: [MessageFlags.Ephemeral]
					});
				}
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			case generateCustomId('chatinput', 'modal', 'embed', 'edit', 'author'): {
				if (!interaction.message) {
					return;
				}
				const rawEmbed = interaction.message.embeds[0];
				if (!rawEmbed) {
					return;
				}
				const embed = EmbedBuilder.from(rawEmbed);
				try {
					embed.setAuthor({
						name: interaction.fields.getTextInputValue('name'),
						iconURL: interaction.fields.getTextInputValue('icon'),
						url: interaction.fields.getTextInputValue('url')
					});
				} catch {
					await interaction.reply({
						embeds: [failEmbed('サムネイルURLが正しくありません')],
						flags: [MessageFlags.Ephemeral]
					});
				}
				await this.edit(embed, interaction);
				return await interaction.deferUpdate();
			}
			default:
				return;
		}
	}
}
