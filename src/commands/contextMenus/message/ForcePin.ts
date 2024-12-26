import {
	ApplicationIntegrationType,
	ChannelType,
	ContextMenuCommandBuilder,
	DiscordAPIError,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
	Webhook,
	WebhookType
} from 'discord.js';
import { fileURLToPath } from 'node:url';
import { SettingManager } from '../../../core/SettingManager.js';
import { type CommandSetting } from '../../../core/types/CommandSetting.js';
import type { MessageContextMenuCommand } from '../../../core/types/ContextCommand.js';
import { failEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import GlobalChatOnMessage from '../../../events/globalChat/onMessage.js';
import { errorReport } from '../../../utils/errorReporter.js';
import { getWebhook } from '../../../utils/getWebhook.js';

export default class ForcePin implements MessageContextMenuCommand {
	public command: ContextMenuCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new ContextMenuCommandBuilder()
			.setName('Force Pin')
			.setType(3)
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild]);
		this.settings = {
			enable: true,
			permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],
			channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText, ChannelType.GuildVoice],
			guildOnly: true
		};
	}

	async run(interaction: MessageContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		if (
			!interaction.channel ||
			interaction.channel.isDMBased() ||
			interaction.channel.type === ChannelType.GuildStageVoice ||
			interaction.channel.isThread()
		) {
			return await interaction.editReply({
				embeds: [failEmbed('Force Pinはこのチャンネルでサポートされていません')]
			});
		}
		const settings = new SettingManager({ channelId: interaction.channelId });
		const channelSetting = await settings.getChannel();
		const util = new GlobalChatOnMessage();

		if (channelSetting && channelSetting.forcePin) {
			const pinData = channelSetting.forcePin;
			const webhook = await getWebhook(interaction.channel);
			const embed = util.webhookErrorEmbed(webhook);

			if (embed) {
				return await interaction.editReply({ embeds: [embed] });
			}
			let deletable = true;
			let followUp = false;
			try {
				await (webhook as Webhook).deleteMessage(pinData.latestMessageId);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						deletable = false;
						await interaction.editReply({
							embeds: [failEmbed('メッセージが削除できませんでした\n解除処理は持続します', 'Force Pinの解除')]
						});
						followUp = true;
					} else if (error.status === 404) {
						await interaction.editReply({
							embeds: [failEmbed('メッセージが削除できませんでした\n解除処理は持続します', 'Force Pinの解除')]
						});
						followUp = true;
					} else {
						const errorId = errorReport(
							fileURLToPath(import.meta.url),
							interaction.channel!,
							interaction.user,
							error,
							interaction.commandName
						);
						followUp = true;
						await interaction.editReply({
							embeds: [
								failEmbed(
									`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
								)
							]
						});
					}
				} else {
					deletable = false;
					const errorId = errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					followUp = true;
					await interaction.editReply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			let deleteMessage = '\n※Force Pinメッセージはエラーによって削除できませんでした';
			if (deletable) {
				deleteMessage = '';
			}
			await settings.updateChannel({
				forcePin: null
			});
			if (followUp) {
				return await interaction.followUp({
					embeds: [
						successEmbed(
							'再登録は、`メッセージを右クリック(長押し) > アプリ > Force Pin` でできます' + deleteMessage,
							'Force Pinを解除しました'
						)
					],
					flags: [MessageFlags.Ephemeral]
				});
			} else {
				return await interaction.editReply({
					embeds: [
						successEmbed(
							'再登録は、`メッセージを右クリック(長押し) > アプリ > Force Pin` でできます' + deleteMessage,
							'Force Pinを解除しました'
						)
					]
				});
			}
		} else {
			const webhook = await getWebhook(interaction.channel);
			const embed = util.webhookErrorEmbed(webhook);

			if (embed) {
				return await interaction.editReply({ embeds: [embed] });
			}
			const data = await util.messageInit(interaction.targetMessage);
			data.embeds = [];
			const WebhookMessage = await (webhook as Webhook<WebhookType.Incoming>).send(data);
			await settings.updateChannel({
				forcePin: {
					attachments: data.files,
					userId: interaction.targetMessage.author.id,
					content: WebhookMessage.cleanContent ?? '(内容無し)',
					latestMessageId: WebhookMessage.id
				}
			});
			return await interaction.editReply({
				embeds: [
					successEmbed(
						'解除は `メッセージを右クリック(長押し) > アプリ > Force Pin` でできます',
						'Force Pinを登録しました'
					)
				]
			});
		}
	}
}
