import { BaseInteraction, ButtonInteraction, Events, GuildMember, MessageFlags, PermissionFlagsBits } from 'discord.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { deleteEmbed, failEmbed } from '../../../embeds/infosEmbed.js';

export default class TanzakuDelete implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async delete(interaction: ButtonInteraction): Promise<unknown> {
		return await interaction.update({
			embeds: [deleteEmbed(`**[ <@!${interaction.user.id}> によって削除されました ]**`, '🎋｜短冊')],
			components: []
		});
	}
	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isButton()) {
			return;
		}
		if (!interaction.customId.startsWith('chatinput_button_tanzaku_delete_userid')) {
			return;
		}

		const userId = interaction.customId.replace('chatinput_button_tanzaku_delete_userid', '');
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
	}
}
