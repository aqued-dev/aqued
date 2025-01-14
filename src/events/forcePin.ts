import { ChannelType, DiscordAPIError, Events, GuildMember, Message, User, Webhook, WebhookType } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { SettingManager } from '../core/SettingManager.js';
import type { EventListener } from '../core/types/EventListener.js';
import { failEmbed } from '../embeds/infosEmbed.js';
import { errorReport } from '../utils/errorReporter.js';
import { getWebhook } from '../utils/getWebhook.js';
import { userFormat } from '../utils/userFormat.js';
import { webhookChecker } from '../utils/webhookChecker.js';
import GlobalChatOnMessage from './globalChat/onMessage.js';

export default class ForcePin implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async beforeCheck(message: Message) {
		const settings = new SettingManager({ channelId: message.channelId });
		const setting = await settings.getChannel();

		if (!setting) {
			return false;
		}
		if (!setting.forcePin) {
			return false;
		}
		if (message.author.id === message.client.user.id || webhookChecker(message.author.discriminator)) {
			return false;
		}
		const channel = message.channel;
		if (channel.isDMBased() || channel.type === ChannelType.GuildStageVoice || channel.isThread()) {
			if (channel.isSendable()) {
				await channel.send({ embeds: [failEmbed('Force Pinに非対応なチャンネルです', '使用不可')] });
			}
			return false;
		}
		if (message.author.system || message.author.bot) {
			await channel.send({ embeds: [failEmbed('BotやWebhookなどのメッセージは送信できません', '送信不可')] });
			return false;
		}

		const webhook = await getWebhook(channel);
		const util = new GlobalChatOnMessage();
		const embed = util.webhookErrorEmbed(webhook);

		if (embed) {
			await channel.send({ embeds: [embed] });
			return false;
		}
		return true;
	}
	async execute(message: Message<true>): Promise<unknown> {
		if (!(await this.beforeCheck(message))) {
			return;
		}
		if (
			message.channel.isDMBased() ||
			message.channel.type === ChannelType.GuildStageVoice ||
			message.channel.isThread()
		) {
			return;
		}

		const settings = new SettingManager({ channelId: message.channelId });
		const setting = await settings.getChannel();
		if (!setting) {
			return;
		}
		const pinData = setting.forcePin;
		if (!pinData) {
			return;
		}
		const webhook = (await getWebhook(message.channel)) as Webhook<WebhookType.Incoming>;
		let user: User | GuildMember | undefined = message.guild.members.cache.get(pinData.userId);
		if (!user) {
			user = message.client.users.cache.get(pinData.userId);
			if (!user) {
				return;
			}
		}
		let icon = user.displayAvatarURL({ extension: 'webp' });
		if (user.avatar && user.avatar.startsWith('a_')) {
			icon = user.displayAvatarURL({ extension: 'gif' });
		}
		try {
			await webhook.deleteMessage(pinData.latestMessageId);
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.status === 403) {
					return message.channel.send({ embeds: [failEmbed('メッセージが削除できませんでした', 'Force Pin')] });
				} else if (error.status === 404) {
					return;
				}
			} else {
				const errorId = await errorReport(
					fileURLToPath(import.meta.url),
					message.channel,
					message.client.user,
					error,
					'',
					'ForcePin/MessageCreate'
				);
				await webhook.send({
					embeds: [
						failEmbed(
							`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
						)
					]
				});
			}
		}
		const WebhookMessage = await webhook.send({
			files: pinData.attachments,
			content: pinData.content,
			avatarURL: icon,
			username: userFormat(user)
		});
		await settings.updateChannel({
			forcePin: {
				attachments: pinData.attachments,
				userId: pinData.userId,
				content: pinData.content,
				latestMessageId: WebhookMessage.id
			}
		});
		return;
	}
}
