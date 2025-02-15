import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Events,
	MessageFlags,
	ModalBuilder,
	OverwriteType,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { dataSource } from '../../../core/typeorm.config.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { FreeChannel } from '../../../database/entities/FreeChannel.js';
import { failEmbed, infoEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class FreeChannelCreate implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isButton()) {
			return;
		}
		const customId = generateCustomId('chatinput', 'button', 'free_channel', 'panel', 'view', 'userid', '');
		const editCustomId = generateCustomId('chatinput', 'button', 'free_channel', 'edit', 'userid', '');

		if (interaction.customId.startsWith(customId)) {
			const id = interaction.customId.replace(customId, '');
			return dataSource.transaction(async (em) => {
				const repo = em.getRepository(FreeChannel);
				const data = await repo.findOne({ where: { id } });
				if (!data) {
					return await interaction.reply({
						embeds: [failEmbed('パネルを再作成するように管理者に報告してください', 'データベースエラー')],
						flags: [MessageFlags.Ephemeral]
					});
				} else {
					const cooldowns = interaction.client.aqued.freeChannelCooldown;

					if (data.userLimit !== '0000') {
						if (
							data.userIds &&
							Number(data.userLimit) === data.userIds.filter((item) => item === interaction.user.id).length
						) {
							return await interaction.reply({
								embeds: [
									failEmbed(`パネル作成者がチャンネル作成数制限を\`${data.userLimit}\`に設定しています`, '作成数制限')
								],
								flags: [MessageFlags.Ephemeral]
							});
						}
					}
					if (!cooldowns.has('freechannel')) {
						cooldowns.set('freechannel', new Map());
					}
					const now = Date.now();
					const timestamps = cooldowns.get('freechannel')!;
					const cooldownAmount = 30000;

					if (timestamps.has(interaction.user.id)) {
						const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

						if (now < expirationTime) {
							const timeLeft = (expirationTime - now) / 1000;
							return await interaction.reply({
								embeds: [failEmbed(`あと、\`${timeLeft.toFixed(1)}\`秒お待ちください`, 'クールダウン')],
								flags: [MessageFlags.Ephemeral]
							});
						}
					}
					timestamps.set(interaction.user.id, now);
					setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
					const category = interaction.client.channels.cache.get(data.categoryId);
					if (!category) {
						return await interaction.reply({ embeds: [failEmbed('カテゴリチャンネルが削除されています', '作成不可')] });
					}
					if (category.type !== ChannelType.GuildCategory) {
						return await interaction.reply({
							embeds: [failEmbed('指定チャンネルがカテゴリチャンネルではありません', '作成不可')]
						});
					}
					const channel = await category.children.create({
						name: `${interaction.user.globalName ?? interaction.user.username}のチャンネル`,
						topic: `<@!${interaction.user.id}>のチャンネルです。`,
						type: ChannelType.GuildText
					});
					channel.permissionOverwrites.set([
						{
							id: interaction.user.id,
							allow: [PermissionFlagsBits.ManageChannels],
							type: OverwriteType.Member
						}
					]);
					await channel.send({
						content: `<@!${interaction.user.id}>、チャンネルを作成しました\n名前等自由に変更できます`,
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setLabel('チャンネルの編集')
									.setStyle(ButtonStyle.Success)
									.setCustomId(
										generateCustomId('chatinput', 'button', 'free_channel', 'edit', 'userid', interaction.user.id)
									)
							)
						]
					});
					const userIds = data.userIds ?? [];
					userIds.push(interaction.user.id);
					await repo.update({ id }, { userIds });
					return await interaction.reply({
						embeds: [infoEmbed(`チャンネルを作成しました: <#${channel.id}>`)],
						flags: [MessageFlags.Ephemeral]
					});
				}
			});
		} else if (interaction.customId.startsWith(editCustomId)) {
			const id = interaction.customId.replace(editCustomId, '');
			if (id !== interaction.user.id) {
				return await interaction.reply({
					embeds: [failEmbed('チャンネル作成者以外は編集できません')],
					flags: [MessageFlags.Ephemeral]
				});
			}
			if (!interaction.channel || (interaction.channel && interaction.channel.type !== ChannelType.GuildText)) {
				return;
			}
			return await interaction.showModal(
				new ModalBuilder()
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('name')
								.setLabel('チャンネル名')
								.setMaxLength(100)
								.setValue(interaction.channel.name)
								.setStyle(TextInputStyle.Short)
								.setRequired(false)
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('topic')
								.setLabel('チャンネルトピック')
								.setMaxLength(1000)
								.setValue(interaction.channel.topic ?? '')
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(false)
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('slowmode')
								.setLabel('低速モードの秒数')
								.setMaxLength(5)
								.setValue(String(interaction.channel.rateLimitPerUser))
								.setStyle(TextInputStyle.Short)
								.setRequired(false)
						)
					)

					.setTitle('チャンネルの編集')
					.setCustomId(generateCustomId('chatinput', 'modal', 'free_channel', 'edit'))
			);
		} else {
			return;
		}
	}
}
