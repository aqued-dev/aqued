import { BaseInteraction, Events } from 'discord.js';
import { Logger } from '../../../core/Logger.js';
import { SettingManager } from '../../../core/SettingManager.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';

export default class SlowModeModal implements EventListener<Events.InteractionCreate> {
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
		if (!interaction.inGuild()) {
			return;
		}
		if (!interaction.channel || !interaction.channelId) {
			return;
		}
		if (interaction.channel.isDMBased()) {
			return;
		}
		if (!interaction.channel.isSendable()) {
			return;
		}
		if (interaction.customId === 'chatinput_modal_leave') {
			const manager = new SettingManager({ guildId: interaction.guildId });
			const message = interaction.fields.getTextInputValue('message');
			try {
				await manager.updateGuild({
					LeaveMessage: { channelId: interaction.channelId, message: message }
				});
				return await interaction.reply({ embeds: [successEmbed('退出メッセージを設定しました')], ephemeral: true });
			} catch (error) {
				Logger.error(error);
				if (interaction.replied) {
					return await interaction.followUp({ embeds: [failEmbed('データの保存に失敗しました')], ephemeral: true });
				} else {
					return await interaction.reply({ embeds: [failEmbed('データの保存に失敗しました')], ephemeral: true });
				}
			}
		} else if (interaction.customId === 'chatinput_modal_welcome') {
			const manager = new SettingManager({ guildId: interaction.guildId });
			const message = interaction.fields.getTextInputValue('message');
			try {
				await manager.updateGuild({
					welcomeMessage: { channelId: interaction.channelId, message: message }
				});
				return await interaction.reply({ embeds: [successEmbed('入室メッセージを設定しました')], ephemeral: true });
			} catch (error) {
				Logger.error(error);
				if (interaction.replied) {
					return await interaction.followUp({ embeds: [failEmbed('データの保存に失敗しました')], ephemeral: true });
				} else {
					return await interaction.reply({ embeds: [failEmbed('データの保存に失敗しました')], ephemeral: true });
				}
			}
		} else {
			return;
		}
	}
}
