import { BaseInteraction, Events, MessageFlags } from 'discord.js';
import { SettingManager } from '../../../core/SettingManager.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

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
		if (interaction.customId === generateCustomId('chatinput', 'modal', 'leave', 'regist')) {
			const manager = new SettingManager({ guildId: interaction.guildId });
			const message = interaction.fields.getTextInputValue('message');
			try {
				await manager.updateGuild({
					leaveMessage: { channelId: interaction.channelId, message: message }
				});
				return await interaction.reply({
					embeds: [successEmbed('退出メッセージを設定しました')],
					flags: [MessageFlags.Ephemeral]
				});
			} catch (error) {
				if (interaction.replied) {
					return await interaction.followUp({
						embeds: [failEmbed('データの保存に失敗しました')],
						flags: [MessageFlags.Ephemeral]
					});
				} else {
					return await interaction.reply({
						embeds: [failEmbed('データの保存に失敗しました')],
						flags: [MessageFlags.Ephemeral]
					});
				}
			}
		} else if (interaction.customId === generateCustomId('chatinput', 'modal', 'welcome', 'regist')) {
			const manager = new SettingManager({ guildId: interaction.guildId });
			const message = interaction.fields.getTextInputValue('message');
			try {
				await manager.updateGuild({
					welcomeMessage: { channelId: interaction.channelId, message: message }
				});
				return await interaction.reply({
					embeds: [successEmbed('入室メッセージを設定しました')],
					flags: [MessageFlags.Ephemeral]
				});
			} catch (error) {
				if (interaction.replied) {
					return await interaction.followUp({
						embeds: [failEmbed('データの保存に失敗しました')],
						flags: [MessageFlags.Ephemeral]
					});
				} else {
					return await interaction.reply({
						embeds: [failEmbed('データの保存に失敗しました')],
						flags: [MessageFlags.Ephemeral]
					});
				}
			}
		} else {
			return;
		}
	}
}
