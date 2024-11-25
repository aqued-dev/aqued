import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonInteraction,
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { Logger } from '../../../core/Logger.js';
import { SettingManager } from '../../../core/SettingManager.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';

export default class WelcomeMessage implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate = Events.InteractionCreate;
	public once = false;

	async execute(interaction: BaseInteraction): Promise<unknown> {
		if (!interaction.isButton() || !interaction.guild) {
			return;
		}
		const base = new WelcomeMessage();
		const { customId, user, guild } = interaction;
		const userId = base.extractUserId(customId);
		if (!userId || user.id !== userId) {
			return base.replyWithFail(interaction, 'あなたはコマンド実行者ではないためボタン操作ができません', '操作不可');
		}

		if (customId.startsWith('chatinput_button_welcome_id_')) {
			return base.showWelcomeModal(interaction);
		} else if (customId.startsWith('chatinput_button_leave_id_')) {
			return base.showLeaveModal(interaction);
		} else if (customId.startsWith('chatinput_button_welcome_delete_id_')) {
			return base.deleteSetting(interaction, guild.id, 'welcomeMessage');
		} else if (customId.startsWith('chatinput_button_leave_delete_id_')) {
			return base.deleteSetting(interaction, guild.id, 'leaveMessage');
		} else {
			return;
		}
	}

	private extractUserId(customId: string): string | undefined {
		const match = customId.match(/chatinput_button_(?:welcome|leave)(?:_delete)?_id_(.+)/);
		return match ? match[1] : undefined;
	}

	private async replyWithFail(interaction: ButtonInteraction, description?: string, title?: string) {
		return await interaction.reply({
			embeds: [failEmbed(description, title)],
			ephemeral: true
		});
	}

	private async showWelcomeModal(interaction: ButtonInteraction) {
		const base = new WelcomeMessage();
		const modal = base.createModal(
			'ウェルカムメッセージの登録',
			'chatinput_modal_welcome',
			'{{user.mention}}が参加しました'
		);
		return interaction.showModal(modal);
	}

	private async showLeaveModal(interaction: ButtonInteraction) {
		const base = new WelcomeMessage();
		const modal = base.createModal('退出メッセージの登録', 'chatinput_modal_leave', '{{user.mention}}が退出しました');
		return interaction.showModal(modal);
	}

	private createModal(title: string, customId: string, placeholder: string): ModalBuilder {
		const messageInput = new TextInputBuilder()
			.setCustomId('message')
			.setLabel('内容')
			.setPlaceholder(placeholder)
			.setValue(placeholder)
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(500);

		return new ModalBuilder()
			.setTitle(title)
			.setCustomId(customId)
			.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput));
	}

	private async deleteSetting(
		interaction: ButtonInteraction,
		guildId: string,
		settingKey: 'welcomeMessage' | 'leaveMessage'
	) {
		const manager = new SettingManager({ guildId });
		const base = new WelcomeMessage();

		try {
			const setting = await manager.getGuild();
			if (!setting || (setting && !setting[settingKey])) {
				return await base.replyWithFail(interaction, '未登録です');
			}
			await manager.updateGuild({ [settingKey]: null });
			return await interaction.reply({ embeds: [successEmbed('登録を解除しました')], ephemeral: true });
		} catch (error) {
			Logger.error(error);
			return await base.replyWithFail(interaction, '不明なエラーで解除できませんでした');
		}
	}
}
