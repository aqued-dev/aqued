import {
	ActionRowBuilder,
	BaseInteraction,
	Events,
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { failEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class EmbedGenerate implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}

	private createModal(
		title: string,
		customId: string,
		inputs: Array<{
			label: string;
			customId: string;
			placeholder: string;
			style: TextInputStyle;
			value?: string;
			required?: boolean;
		}>
	): ModalBuilder {
		const modal = new ModalBuilder().setTitle(title).setCustomId(customId);
		const rows = inputs.map((input) =>
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setLabel(input.label)
					.setCustomId(input.customId)
					.setPlaceholder(input.placeholder)
					.setStyle(input.style)
					.setValue(input.value ?? '')
					.setRequired(input.required ?? true)
			)
		);
		modal.addComponents(...rows);
		return modal;
	}

	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (
			!interaction.isStringSelectMenu() ||
			interaction.customId !== generateCustomId('chatinput', 'select', 'embed', 'edit')
		) {
			return;
		}

		const embed = interaction.message.embeds[0];
		if (!embed) {
			return await interaction.reply({
				embeds: [failEmbed('原因不明でメッセージ内の埋め込みが削除されているため、変更できません')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		const { title, description, url, hexColor, footer, image, thumbnail, author } = embed;
		switch (interaction.values[0]) {
			case 'title':
				return await interaction.showModal(
					this.createModal('タイトル - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'title'), [
						{
							label: 'タイトル',
							customId: 'title',
							placeholder: 'タイトルを入力...',
							style: TextInputStyle.Short,
							value: title ?? ''
						}
					])
				);

			case 'description':
				return await interaction.showModal(
					this.createModal('説明 - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'description'), [
						{
							label: '説明',
							customId: 'description',
							placeholder: '説明を入力...',
							style: TextInputStyle.Paragraph,
							value: description ?? ''
						}
					])
				);

			case 'url':
				return await interaction.showModal(
					this.createModal('URL - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'url'), [
						{
							label: 'url',
							customId: 'url',
							placeholder: 'urlを入力...',
							style: TextInputStyle.Short,
							value: url ?? ''
						}
					])
				);

			case 'color':
				return await interaction.showModal(
					this.createModal('カラー - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'color'), [
						{
							label: 'カラー',
							customId: 'color',
							placeholder: '16進数カラーコードを入力...',
							style: TextInputStyle.Short,
							value: hexColor ?? ''
						}
					])
				);

			case 'footer':
				return await interaction.showModal(
					this.createModal('フッター - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'footer'), [
						{
							label: 'フッターテキスト',
							customId: 'text',
							placeholder: 'フッターテキストを入力...',
							style: TextInputStyle.Short,
							value: footer?.text ?? ''
						},
						{
							label: 'フッターアイコンのurl',
							customId: 'icon',
							placeholder: 'フッターアイコンのurlを入力...',
							style: TextInputStyle.Short,
							value: footer?.iconURL ?? ''
						}
					])
				);

			case 'image':
				return await interaction.showModal(
					this.createModal('画像 - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'image'), [
						{
							label: '画像',
							customId: 'image',
							placeholder: '画像urlを入力...',
							style: TextInputStyle.Short,
							value: image?.url ?? ''
						}
					])
				);

			case 'thumbnail':
				return await interaction.showModal(
					this.createModal(
						'サムネイル - Embed編集',
						generateCustomId('chatinput', 'modal', 'embed', 'edit', 'thumbnail'),
						[
							{
								label: 'サムネイル画像url',
								customId: 'thumbnailurl',
								placeholder: 'サムネイル画像urlを入力...',
								style: TextInputStyle.Short,
								value: thumbnail?.url ?? ''
							}
						]
					)
				);

			case 'author':
				return await interaction.showModal(
					this.createModal('著者 - Embed編集', generateCustomId('chatinput', 'modal', 'embed', 'edit', 'author'), [
						{
							label: '著者名',
							customId: 'name',
							placeholder: '名前を入力...',
							style: TextInputStyle.Short,
							value: author?.name ?? ''
						},
						{
							label: '著者アイコン',
							customId: 'icon',
							placeholder: 'アイコンurlを入力...',
							style: TextInputStyle.Short,
							value: author?.iconURL ?? ''
						},
						{
							label: '著者URL',
							customId: 'url',
							placeholder: 'urlを入力...',
							style: TextInputStyle.Short,
							value: author?.url ?? ''
						}
					])
				);

			default:
				return;
		}
	}
}
