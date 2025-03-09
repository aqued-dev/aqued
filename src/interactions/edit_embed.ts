import {
	ActionRowBuilder,
	BaseInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	ModalSubmitInteraction,
} from 'discord.js';
async function edit(embed: EmbedBuilder, interaction: ModalSubmitInteraction) {
	const APIfields = embed.data.fields || [];

	const fields = [];

	for (let index = 0; index < 25; index++) {
		const field = APIfields[index];
		const label = `フィールド${index + 1}`;
		const description = field ? field.name : 'なし';
		const value = `field${index + 1}`;

		fields.push({
			label,
			description,
			value,
		});
	}

	await interaction.message.edit({
		embeds: [embed],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setPlaceholder('embedの編集...')
					.setCustomId('embed_edit_select')
					.setMaxValues(1)
					.addOptions(
						{
							label: 'タイトル',
							description: embed.data.title || 'なし',
							value: 'title',
						},
						{
							label: '説明',
							description: embed.data.description || 'なし',
							value: 'description',
						},
						{ label: 'url', description: embed.data.url || 'なし', value: 'url' },
						{
							label: '色',
							description: embed.data.color ? '#' + embed.data.color.toString(16).padStart(2, '0') : '#000000',
							value: 'color',
						},
						{ label: 'フッター', description: embed.data.footer ? embed.data.footer.text : 'なし', value: 'footer' },
						{ label: '画像', description: embed.data.image ? embed.data.image.url : 'なし', value: 'image' },
						{
							label: 'サムネイル',
							description: embed.data.thumbnail ? embed.data.thumbnail.url : 'なし',
							value: 'thumbnail',
						},
						{ label: '著者', description: embed.data.author ? embed.data.author.name : 'なし', value: 'author' },
					),
			),
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setPlaceholder('フィールドの編集...')
					.setCustomId('embed_fields_edit_select')
					.setMaxValues(1)
					.addOptions(fields),
			),
		],
	});
}
export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) {
		return;
	}
	switch (interaction.customId) {
		case 'embed_modal_0': {
			const embed = EmbedBuilder.from(interaction.message.embeds[0]);
			embed.setTitle(interaction.fields.getTextInputValue('title'));
			await interaction.message.edit({ embeds: [embed], components: [] });
			await edit(embed, interaction);
			await interaction.deferUpdate();
			break;
		}
		case 'embed_modal_1': {
			const embed = EmbedBuilder.from(interaction.message.embeds[0]);
			if (interaction.fields.getTextInputValue('description')) {
				embed.setDescription(interaction.fields.getTextInputValue('description'));
			}
			await edit(embed, interaction);
			await interaction.deferUpdate();
			break;
		}
		case 'embed_modal_2': {
			try {
				const embed = EmbedBuilder.from(interaction.message.embeds[0]);
				embed.setURL(interaction.fields.getTextInputValue('url'));
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} catch {
				await interaction.reply({ content: 'URLが正しくありません。', ephemeral: true });
			}
			break;
		}
		case 'embed_modal_3': {
			const embed = EmbedBuilder.from(interaction.message.embeds[0]);
			const color = /^#([\dA-Fa-f]{6})$/.test(interaction.fields.getTextInputValue('color'));
			if (color) {
				embed.setColor(`#${interaction.fields.getTextInputValue('color').replaceAll('#', '')}`);
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} else {
				await interaction.reply({
					content: '正しい16進数カラーコードを入力してください。(3桁は非対応です。)',
					ephemeral: true,
				});
			}

			break;
		}
		case 'embed_modal_4': {
			try {
				const embed = EmbedBuilder.from(interaction.message.embeds[0]);
				embed.setFooter({ text: interaction.fields.getTextInputValue('text') });
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} catch {
				await interaction.reply({ content: 'URLが正しくありません。', ephemeral: true });
			}
			break;
		}
		case 'embed_modal_5': {
			try {
				const embed = EmbedBuilder.from(interaction.message.embeds[0]);
				embed.setImage(interaction.fields.getTextInputValue('image'));
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} catch {
				await interaction.reply({ content: 'URLが正しくありません。', ephemeral: true });
			}
			break;
		}
		case 'embed_modal_6': {
			try {
				const embed = EmbedBuilder.from(interaction.message.embeds[0]);
				embed.setThumbnail(interaction.fields.getTextInputValue('thumbnailurl'));
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} catch {
				await interaction.reply({ content: 'URLが正しくありません。', ephemeral: true });
			}
			break;
		}
		case 'embed_modal_7': {
			try {
				const embed = EmbedBuilder.from(interaction.message.embeds[0]);
				embed.setAuthor({
					name: interaction.fields.getTextInputValue('name'),
					iconURL: interaction.fields.getTextInputValue('icon'),
					url: interaction.fields.getTextInputValue('url'),
				});
				await edit(embed, interaction);
				await interaction.deferUpdate();
			} catch {
				await interaction.reply({ content: 'URLが正しくありません。', ephemeral: true });
			}
			break;
		}
	}
}
