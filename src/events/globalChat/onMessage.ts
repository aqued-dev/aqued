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
	type SendableChannels
} from 'discord.js';
import { Not } from 'typeorm';
import { constants } from '../../config/constants.js';
import { Logger } from '../../core/Logger.js';
import { SettingManager } from '../../core/SettingManager.js';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { failEmbed, replyEmbed } from '../../embeds/infosEmbed.js';
import { getWebhook, WebhookStatus } from '../../utils/getWebhook.js';
import { userFormat } from '../../utils/userFormat.js';
/***
 * グローバルチャットメッセージ送受信
 */
export default class MessageCreate implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async fail(embed: EmbedBuilder, message: Message) {
		await message.react('❌');
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
				'Webhookの取得中に、原因不明のエラーが発生しました\nサポートサーバーにてお問い合わせください',
				'不明'
			);
		} else if (webhook === WebhookStatus.PermissionError) {
			return failEmbed('グローバルチャットには、Botに **`ウェブフックの管理`** 権限が必要です', '権限不足');
		} else if (webhook === WebhookStatus.ParentChannel) {
			return failEmbed('このスレッドの親チャンネルが存在しません', 'スレッドエラー');
		} else {
			return null;
		}
	}
	async beforeCheck(message: Message) {
		const settings = new SettingManager({ channelId: message.channelId });
		const setting = await settings.getChannel();

		if (!setting) {
			return false;
		}
		if (!setting.globalChat) {
			return false;
		}
		if (message.author.id === message.client.user.id || message.author.discriminator === '0000') {
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
		].every((regex) => regex.test(message.cleanContent));
		if (regexMatchesAll) {
			return await this.fail(failEmbed('メッセージに招待リンクが含まれています', '送信不可'), message);
		}
		return true;
	}
	async messageInit(message: Message) {
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
		let content: string | null = message.cleanContent;
		const splitContent = content.slice(0, 1900);
		if (content !== splitContent) {
			content = `${splitContent}...(メッセージ省略)`;
		}
		if (message.reference) {
			const repliedMessage = await message.fetchReference();
			const content = repliedMessage.content ?? 'メッセージの内容なし';
			// Todo: Reply URLを各自で変える
			embeds.push(
				replyEmbed(`[${content}](${repliedMessage.url})`, undefined, undefined, userFormat(repliedMessage.author))
			);
		}
		embeds.push(
			new EmbedBuilder().setDescription(`uId: ${message.author.id} / mId: ${message.id}`).setColor(Colors.Blue)
		);
		return {
			username: username,
			content: content,
			files: attachments,
			avatarURL: icon,
			embeds: embeds
		};
	}
	async send(message: Message) {
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSettings = await repo.find({ where: { channelId: Not(message.channelId) } });
		if (channelSettings.length === 0) {
			return await this.fail(
				failEmbed('グローバルチャットに参加しているチャンネルが他に一つもありません', '送信不可'),
				message
			);
		}
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
			const data = await this.messageInit(message);
			await (webhook as Webhook<WebhookType.Incoming>).send(data);
		}
		return await message.react('✅');
	}
	async execute(message: Message) {
		const check = await this.beforeCheck(message);
		if (check) {
			try {
				await this.send(message);
			} catch (error) {
				Logger.error(error);
				await this.fail(
					failEmbed(
						'メッセージ送信中に、原因不明のエラーが発生しました\nサポートサーバーにてお問い合わせください',
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
