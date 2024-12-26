import {
	AttachmentBuilder,
	ChannelType,
	Colors,
	DiscordAPIError,
	EmbedBuilder,
	Events,
	Message,
	StickerFormatType,
	Webhook,
	WebhookType,
	type OmitPartialGroupDMChannel,
	type PartialMessage,
	type SendableChannels
} from 'discord.js';
import { Not } from 'typeorm';
import { fileURLToPath } from 'url';
import { constants } from '../../config/constants.js';
import { emojis } from '../../config/emojis.js';
import { Logger } from '../../core/Logger.js';
import { SettingManager } from '../../core/SettingManager.js';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { GlobalChatBan } from '../../database/entities/GlobalChatBan.js';
import { GlobalChatMessage, type GlobalChatMessages } from '../../database/entities/GlobalChatMessage.js';
import { failEmbed, replyEmbed } from '../../embeds/infosEmbed.js';
import { errorReport } from '../../utils/errorReporter.js';
import { getWebhook, WebhookStatus } from '../../utils/getWebhook.js';
import { userFormat } from '../../utils/userFormat.js';
import { webhookChecker } from '../../utils/webhookChecker.js';
/***
 * グローバルチャットメッセージ送受信
 */
export default class GlobalChatOnMessage implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async fail(embed: EmbedBuilder, message: Message | OmitPartialGroupDMChannel<Message | PartialMessage>) {
		await message.react(emojis().no);
		return await message.reply({
			embeds: [embed]
		});
	}
	async remoteFail(embed: EmbedBuilder, channel: SendableChannels) {
		try {
			await channel.send({
				embeds: [embed]
			});
		} catch (error) {
			if (error instanceof DiscordAPIError && error.status === 403) {
				return;
			} else {
				Logger.error(error);
			}
		}
		return;
	}
	webhookErrorEmbed(webhook: Webhook<WebhookType.Incoming> | WebhookStatus): EmbedBuilder | null {
		if (webhook === WebhookStatus.UnknownError) {
			return failEmbed(
				'Webhookの取得中に、原因不明のエラーが発生しました',
				'不明'
			);
		} else if (webhook === WebhookStatus.PermissionError) {
			return failEmbed('この機能には、Botに **`ウェブフックの管理`** 権限が必要です', '権限不足');
		} else if (webhook === WebhookStatus.ParentChannel) {
			return failEmbed('このスレッドの親チャンネルが存在しません', 'スレッドエラー');
		} else {
			return null;
		}
	}
	async beforeCheck(message: Message | OmitPartialGroupDMChannel<Message | PartialMessage>) {
		const settings = new SettingManager({ channelId: message.channelId });
		const setting = await settings.getChannel();
		const repo = dataSource.getRepository(GlobalChatBan);
		if (!setting) {
			return false;
		}
		if (!setting.globalChat) {
			return false;
		}
		if (!message.author) {
			return false;
		}
		const block = await repo.findOne({ where: { id: message.author.id } });
		if (block) {
			await this.fail(
				failEmbed(`あなたは送信ブロック処置がされています\n**理由**\n${block.reason}`, '送信不可'),
				message
			);
			return false;
		}
		if (message.author.id === message.client.user.id || webhookChecker(message.author.discriminator)) {
			return false;
		}
		if (message.author.system || message.author.bot) {
			await this.fail(failEmbed('BotやWebhookなどのメッセージは送信できません', '送信不可'), message);
			return false;
		}

		const channel = message.channel;
		if (channel.isDMBased() || channel.type === ChannelType.GuildStageVoice || channel.isThread()) {
			await this.fail(failEmbed('グローバルチャットに非対応なチャンネルです', '使用不可'), message);
			return false;
		}

		const webhook = await getWebhook(channel);
		const embed = this.webhookErrorEmbed(webhook);

		if (embed) {
			await this.fail(embed, message);
			return false;
		}
		const regexMatchesAll = [
			constants.regexs.inviteUrls.dicoall,
			constants.regexs.inviteUrls.disboard,
			constants.regexs.inviteUrls.discoparty,
			constants.regexs.inviteUrls.discord,
			constants.regexs.inviteUrls.discordCafe,
			constants.regexs.inviteUrls.dissoku,
			constants.regexs.inviteUrls.sabach
		].every((regex) => regex.test(message.cleanContent ?? ''));
		if (regexMatchesAll) {
			return await this.fail(failEmbed('メッセージに招待リンクが含まれています', '送信不可'), message);
		}
		return true;
	}
	async messageInit(message: Message, guildId?: string, channelId?: string) {
		let icon = message.author.displayAvatarURL({ extension: 'webp' });
		if (message.author.avatar && message.author.avatar.startsWith('a_')) {
			icon = message.author.displayAvatarURL({ extension: 'gif' });
		}
		const embeds: EmbedBuilder[] = [];

		const sticker = message.stickers.first();
		if (sticker && sticker?.format !== StickerFormatType.Lottie) {
			const embed = new EmbedBuilder().setTitle('ステッカー').setColor(Colors.Blue).setImage(sticker.url);
			embeds.push(embed);
		}

		const attachments = message.attachments.toJSON().map((value) => {
			return new AttachmentBuilder(value.url);
		});

		const username = userFormat(message.author);
		let content: string = message.cleanContent;
		const splitContent = content.slice(0, 1900);
		if (content !== splitContent) {
			content = `${splitContent}...(メッセージ省略)`;
		}
		if (message.reference && guildId && channelId) {
			const repliedMessage = await message.fetchReference();
			const content = repliedMessage.content ?? 'メッセージの内容なし';
			const repo = dataSource.getRepository(GlobalChatMessage);
			const baseData = await repo.findOne({ where: { id: repliedMessage.id } });
			const webhookData: { id: string; channelId: string; guildId: string; messages: GlobalChatMessages[] }[] =
				await repo.query(`SELECT * FROM GLOBAL_CHAT_MESSAGE WHERE JSON_SEARCH(messages, 'one', ?) IS NOT NULL`, [
					repliedMessage.id
				]);
			const data = baseData ?? webhookData[0];
			const messages = data?.messages;
			if (data && messages) {
				const webhookMessage = messages.find((data) => data.channelId === channelId);
				if (webhookMessage) {
					const url = `https://discord.com/channels/${guildId}/${channelId}/${webhookMessage.messageId}`;
					embeds.push(
						replyEmbed(
							`[${content}](${url})`,
							undefined,
							undefined,
							userFormat(repliedMessage.author).replace('#0000', '')
						)
					);
				} else {
					const url = `https://discord.com/channels/${data.guildId}/${data.channelId}/${data.id}`;
					embeds.push(
						replyEmbed(
							`[${content}](${url})`,
							undefined,
							undefined,
							userFormat(repliedMessage.author).replace('#0000', '')
						)
					);
				}
			}
		}
		return {
			username: username,
			content: content,
			files: attachments,
			avatarURL: icon,
			embeds: embeds
		};
	}
	async send(message: Message<true>) {
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSettings = await repo.find({ where: { channelId: Not(message.channelId) } });
		if (channelSettings.length === 0) {
			return await this.fail(
				failEmbed('グローバルチャットに参加しているチャンネルが他に一つもありません', '送信不可'),
				message
			);
		}
		const messagesData: GlobalChatMessages[] = [];
		for (const setting of channelSettings) {
			const channel = message.client.channels.cache.get(setting.channelId);
			if (!channel) {
				continue;
			}
			if (!channel.isSendable() || channel.isDMBased() || channel.type === ChannelType.GuildStageVoice) {
				continue;
			}
			const webhook = await getWebhook(channel);
			const webhookCheck = this.webhookErrorEmbed(webhook);
			if (webhookCheck) {
				await this.remoteFail(webhookCheck, channel);
				continue;
			}
			const data = await this.messageInit(message, channel.guildId, channel.id);
			const webhookMessage = await (webhook as Webhook<WebhookType.Incoming>).send(data);
			messagesData.push({
				messageId: webhookMessage.id,
				webhookUrl: (webhook as Webhook<WebhookType.Incoming>).url,
				channelId: channel.id
			});
		}
		dataSource.transaction(async (em) => {
			const repo = em.getRepository(GlobalChatMessage);
			const globalChatMessage = new GlobalChatMessage(message.id, message.channelId, message.guildId, messagesData);
			await repo.save(globalChatMessage);
		});
		return await message.react(emojis().check);
	}
	async execute(message: Message<true>) {
		const check = await this.beforeCheck(message);
		if (check) {
			try {
				await this.send(message);
			} catch (error) {
				const errorId = errorReport(
					fileURLToPath(import.meta.url),
					message.channel,
					message.author,
					error,
					'globalchat',
					Events.MessageCreate
				);
				await this.fail(
					failEmbed(
						'メッセージ送信中に、原因不明のエラーが発生しました\nサポートサーバーにてお問い合わせください\nエラーID: ' +
							errorId,
						'不明'
					),
					message
				);
			}
		} else {
			return;
		}
	}
}
