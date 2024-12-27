import { BaseInteraction, ButtonInteraction, Events, GuildMember, MessageFlags, PermissionFlagsBits } from 'discord.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { deleteEmbed, failEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class EmbedDeleteAndEditEnd implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async delete(interaction: ButtonInteraction): Promise<unknown> {
		return await interaction.update({
			embeds: [deleteEmbed(`**[ <@!${interaction.user.id}> によって削除されました ]**`, '埋め込み作成')],
			components: []
		});
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isButton()) {
			return;
		}
		const customId = generateCustomId('chatinput', 'button', 'embed', 'delete', 'userid', '');
		const endCustomId = generateCustomId('chatinput', 'button', 'embed', 'end', 'userid', '');
		if (interaction.customId.startsWith(customId)) {
			const userId = interaction.customId.replace(customId, '');
			if (userId !== interaction.user.id) {
				if (
					interaction.member &&
					interaction.member instanceof GuildMember &&
					interaction.channel &&
					!interaction.channel.isDMBased() &&
					interaction.member.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages)
				) {
					return await this.delete(interaction);
				} else {
					return await interaction.reply({
						embeds: [failEmbed('削除は実行者またはメッセージ管理権限を持っている人のみです')],
						flags: [MessageFlags.Ephemeral]
					});
				}
			}
			return await this.delete(interaction);
		} else if (interaction.customId.startsWith(endCustomId)) {
			const userId = interaction.customId.replace(endCustomId, '');
			if (userId === interaction.user.id) {
				await interaction.message.edit({ components: [] });
				return await interaction.deferUpdate();
			} else {
				return await interaction.reply({
					embeds: [failEmbed('編集終了は実行者のみ可能です')],
					flags: [MessageFlags.Ephemeral]
				});
			}
		} else {
			return;
		}
	}
}
