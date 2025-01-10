import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonInteraction,
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { fileURLToPath } from 'node:url';
import { SettingManager } from '../../../core/SettingManager.js';
import { type EventListener } from '../../../core/types/EventListener.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import { errorReport } from '../../../utils/errorReporter.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

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

		if (customId.startsWith(generateCustomId('chatinput', 'button', 'welcome', 'id', ''))) {
			if (!userId || user.id !== userId) {
				return base.replyWithFail(interaction, 'あなたはコマンド実行者ではないためボタン操作ができません', '操作不可');
			}
			return base.showWelcomeModal(interaction);
		} else if (customId.startsWith(generateCustomId('chatinput', 'button', 'leave', 'id', ''))) {
			if (!userId || user.id !== userId) {
				return base.replyWithFail(interaction, 'あなたはコマンド実行者ではないためボタン操作ができません', '操作不可');
			}
			return base.showLeaveModal(interaction);
		} else if (customId.startsWith(generateCustomId('chatinput', 'button', 'welcome', 'delete', 'id', ''))) {
			if (!userId || user.id !== userId) {
				return base.replyWithFail(interaction, 'あなたはコマンド実行者ではないためボタン操作ができません', '操作不可');
			}
			return base.deleteSetting(interaction, guild.id, 'welcomeMessage');
		} else if (customId.startsWith(generateCustomId('chatinput', 'button', 'leave', 'delete', 'id', ''))) {
			if (!userId || user.id !== userId) {
				return base.replyWithFail(interaction, 'あなたはコマンド実行者ではないためボタン操作ができません', '操作不可');
			}
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
			generateCustomId('chatinput', 'modal', 'welcome', 'regist'),
			'{{user.mention}}が参加しました'
		);
		return interaction.showModal(modal);
	}

	private async showLeaveModal(interaction: ButtonInteraction) {
		const base = new WelcomeMessage();
		const modal = base.createModal(
			'退出メッセージの登録',
			generateCustomId('chatinput', 'modal', 'leave', 'regist'),
			'{{user.mention}}が退出しました'
		);
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
			const errorId = await errorReport(
				fileURLToPath(import.meta.url),
				interaction.channel!,
				interaction.user,
				error,
				'',
				Events.InteractionCreate,
				settingKey + 'delete'
			);
			return await base.replyWithFail(
				interaction,
				'不明なエラーで解除できませんでした\nエラーID: ' +
					errorId +
					'サポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn'
			);
		}
	}
}
