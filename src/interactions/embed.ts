import { TextInputStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, BaseInteraction } from 'discord.js';
export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) {
		return;
	}
	if (interaction.customId !== 'embed_edit_select') {
		return;
	}
	switch (interaction.values[0]) {
		case 'title': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('タイトル - Embed編集')
					.setCustomId('embed_modal_0')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('タイトル')
								.setMaxLength(100)
								.setCustomId('title')
								.setPlaceholder('タイトルを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].title ?? '') : '')
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'description': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('説明 - Embed編集')
					.setCustomId('embed_modal_1')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('説明')
								.setMaxLength(1000)
								.setCustomId('description')
								.setPlaceholder('説明を入力...')
								.setStyle(TextInputStyle.Paragraph)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].description ?? '') : '',
								)
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'url': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('URL - Embed編集')
					.setCustomId('embed_modal_2')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('url')
								.setCustomId('url')
								.setPlaceholder('urlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].url ?? '') : '')
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'color': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('カラー - Embed編集')
					.setCustomId('embed_modal_3')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('カラー')
								.setCustomId('color')
								.setPlaceholder('16進数カラーコードを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(interaction.message.embeds.length > 0 ? interaction.message.embeds[0].hexColor : '')
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'footer': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('フッター - Embed編集')
					.setCustomId('embed_modal_4')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('フッターテキスト')
								.setCustomId('text')
								.setPlaceholder('フッターテキストを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].footer?.text ?? '') : '',
								)
								.setRequired(true),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('フッターアイコンのurl')
								.setCustomId('icon')
								.setPlaceholder('フッターアイコンのurlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].footer?.iconURL ?? '') : '',
								)
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'image': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('画像 - Embed編集')
					.setCustomId('embed_modal_5')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('画像')
								.setCustomId('image')
								.setPlaceholder('画像urlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].image?.url ?? '') : '')
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'thumbnail': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('サムネイル - Embed編集')
					.setCustomId('embed_modal_6')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('サムネイル画像url')
								.setCustomId('thumbnailurl')
								.setPlaceholder('サムネイル画像urlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].thumbnail?.url ?? '') : '',
								)
								.setRequired(true),
						),
					),
			);
			break;
		}
		case 'author': {
			await interaction.showModal(
				new ModalBuilder()
					.setTitle('著者 - Embed編集')
					.setCustomId('embed_modal_7')
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('著者名')
								.setCustomId('name')
								.setPlaceholder('名前を入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].author?.name ?? '') : '',
								)
								.setRequired(true),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('著者アイコン')
								.setCustomId('icon')
								.setPlaceholder('アイコンurlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].author?.iconURL ?? '') : '',
								)
								.setRequired(true),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setLabel('著者URL')
								.setCustomId('url')
								.setPlaceholder('urlを入力...')
								.setStyle(TextInputStyle.Short)
								.setValue(
									interaction.message.embeds.length > 0 ? (interaction.message.embeds[0].author?.url ?? '') : '',
								)
								.setRequired(true),
						),
					),
			);
			break;
		}
	}
}
