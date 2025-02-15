import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Events,
	MessageFlags
} from 'discord.js';
import { emojis } from '../../../config/emojis.js';
import { dataSource } from '../../../core/typeorm.config.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { FreeChannel } from '../../../database/entities/FreeChannel.js';
import { failEmbed, infoEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class FreeChannelPanelCreate implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isModalSubmit()) {
			return;
		}
		const customId = generateCustomId('chatinput', 'modal', 'free_channel', 'panel', 'create', 'userid', '');
		if (interaction.customId.startsWith(customId)) {
			const id = interaction.customId.replace(customId, '');

			const title = interaction.fields.getTextInputValue('title');
			const message = interaction.fields.getTextInputValue('message');
			const userLimit = interaction.fields.getTextInputValue('user_limit') || '0000';
			if (Number.isNaN(Number(userLimit))) {
				return await interaction.reply({
					embeds: [failEmbed('数字以外は受け付けません', 'チャンネル数制限')],
					flags: [MessageFlags.Ephemeral]
				});
			} else if ((userLimit !== '0000' && Number(userLimit) < 1) || Number(userLimit) > 20) {
				return await interaction.reply({
					embeds: [failEmbed('1-20の数字ではありません', 'チャンネル数制限')],
					flags: [MessageFlags.Ephemeral]
				});
			}
			return dataSource.transaction(async (em) => {
				const repo = em.getRepository(FreeChannel);
				const data = await repo.findOne({ where: { id } });
				if (!data) {
					return await interaction.reply({
						embeds: [failEmbed('最初からやり直してください', 'データベースエラー')],
						flags: [MessageFlags.Ephemeral]
					});
				} else {
					await repo.update({ id }, { userLimit });
					return await interaction.reply({
						embeds: [
							infoEmbed(message || '以下のボタンを押すことでチャンネル作成ができます', title || '🪧｜チャンネル作成')
						],
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setLabel('チャンネルを作成')
									.setStyle(ButtonStyle.Primary)
									.setEmoji(emojis().check)
									.setCustomId(generateCustomId('chatinput', 'button', 'free_channel', 'panel', 'view', 'userid', id))
							)
						]
					});
				}
			});
		} else if (interaction.customId === generateCustomId('chatinput', 'modal', 'free_channel', 'edit')) {
			if (!interaction.channel || (interaction.channel && interaction.channel.type !== ChannelType.GuildText)) {
				return;
			}
			const name = interaction.fields.getTextInputValue('name') || interaction.channel.name;
			const topic = interaction.fields.getTextInputValue('topic') || interaction.channel.topic;
			const slowmode =
				interaction.fields.getTextInputValue('slowmode') ||
				(interaction.channel.rateLimitPerUser && String(interaction.channel.rateLimitPerUser));

			if (Number.isNaN(Number(slowmode))) {
				return await interaction.reply({
					embeds: [failEmbed('数字を入力してください', '低速モード')],
					flags: [MessageFlags.Ephemeral]
				});
			} else if (Number(slowmode) < 0 || Number(slowmode) > 21_600) {
				return await interaction.reply({
					embeds: [failEmbed('値が無効です', '低速モード')],
					flags: [MessageFlags.Ephemeral]
				});
			}
			await interaction.channel.edit({ name, topic, rateLimitPerUser: Number(slowmode) });
			return await interaction.reply({
				embeds: [successEmbed('変更に成功しました')],
				flags: [MessageFlags.Ephemeral]
			});
		} else {
			return;
		}
	}
}
