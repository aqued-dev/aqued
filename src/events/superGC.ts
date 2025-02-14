import {
	APIAllowedMentions,
	calculateUserDefaultAvatarIndex,
	ChannelType,
	DiscordAPIError,
	Events,
	Message,
	MessageManager,
	MessageMentionOptions,
	MessagePayload,
	Snowflake,
	Webhook,
	WebhookMessageCreateOptions,
	WebhookType
} from 'discord.js';
import { Not } from 'typeorm';
import { config } from '../config/config.js';
import { constants } from '../config/constants.js';
import { EmojiData, emojis } from '../config/emojis.js';
import { Logger } from '../core/Logger.js';
import { SettingManager } from '../core/SettingManager.js';
import { dataSource } from '../core/typeorm.config.js';
import { EventListener } from '../core/types/EventListener.js';
import { ChannelSetting } from '../database/entities/ChannelSetting.js';
import { GlobalChatBan } from '../database/entities/GlobalChatBan.js';
import { SuperGlobalChatData } from '../database/entities/SuperGlobalChatData.js';
import { failEmbed, replyEmbed } from '../embeds/infosEmbed.js';
import { getIconUrl } from '../utils/getIconUrl.js';
import { getWebhook } from '../utils/getWebhook.js';
import { JsonArrayContains } from '../utils/jsonArrayContains.js';
import { miniUserFormat } from '../utils/userFormat.js';
import { webhookChecker } from '../utils/webhookChecker.js';
import GlobalChatOnMessage from './globalChat/onMessage.js';

type KensakuType = 'kensaku-complete' | 'kensaku-error';
type PgType = 'pg-recovery';
type RinType = 'rin-guildJoin' | 'rin-guildLeft' | `rin-guildJoin-${string}` | `rin-guildLeft-${string}`;
enum CommonType {
	Message = 'message',
	Edit = 'edit',
	Delete = 'delete',
	Empty = 'empty'
}
type DataType = CommonType | KensakuType | PgType | RinType;
interface BaseData {
	type: DataType;
}
interface MessageData extends BaseData {
	/**
	 * データの種類(必須)
	 */
	'type': CommonType.Message;
	/**
	 * バージョン(推奨)
	 * 現在の最新は2.1.7(2.1+1.7)
	 */
	'version'?: `2.${string}.7`;
	/**
	 * ユーザーID(必須)
	 */
	'userId': Snowflake;
	/**
	 * ユーザー名(Pomelo)
	 */
	'userName': string;
	/**
	 * ユーザータグ(Botのみ)(必須)
	 */
	'userDiscriminator': string;
	/**
	 * アイコンハッシュ(必須)
	 */
	'userAvatar': string | null;
	/**
	 * 送信者がBotであるか(推奨)
	 */
	'isBot'?: boolean;
	/**
	 * ギルドID(必須)
	 */
	'guildId': Snowflake;
	/**
	 * ギルド名
	 */
	'guildName': string;
	/**
	 * ギルドアイコンハッシュ(必須)
	 */
	'guildIcon': string | null;
	/**
	 * チャンネルID(推奨)
	 */
	'channelId'?: string;
	/**
	 * チャンネル名(推奨)
	 */
	'channelName'?: string;
	/**
	 * メッセージID(推奨)
	 */
	'messageId'?: Snowflake;
	/**
	 * メッセージ内容
	 */
	'content': string;
	/**
	 * 返信先メッセージID(推奨)
	 */
	'reference'?: string;
	/**
	 * 添付ファイルのURL配列。ある場合は必須。
	 */
	'attachmentsUrl'?: string[];
	/**
	 * (議論中の仕様であり、先行実装)
	 * User Objectのglobal_nameに相当
	 */
	'x-userGlobal_name'?: string | null;
	/**
	 * (議論中の仕様であり、先行実装)
	 * Discord APIのAllow Mentionsと同等
	 */
	'x-allowed_mentions'?: APIAllowedMentions;
	/**
	 * (独自)暇人Botのglobal_name
	 */
	'hm-globalName'?: string | null;
	/**
	 * (独自)凛Botの絵文字URL
	 * データ形式: {":emojiname:":"url"}
	 */
	'rin-emojis'?: Record<string, string>;
	/**
	 * (独自)Aquedがデフォルトアイコンの値(0-5)を返します
	 */
	'aq-defaultAvatar'?: string;
}
interface EditData extends BaseData {
	type: CommonType.Edit;
	messageId: string;
	content: string;
}
export default class SuperGlobalChatOnMessage implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	isMessageData(data: BaseData): data is MessageData {
		return data.type === CommonType.Message;
	}

	async dataGenerate(message: Message<true>) {
		const data: MessageData = {
			'type': CommonType.Message,
			'version': '2.0.7',
			'userId': message.author.id,
			'userName': message.author.username,
			'userDiscriminator': message.author.discriminator,
			'userAvatar': message.author.avatar,
			'isBot': message.author.bot,
			'guildId': message.guild.id,
			'guildName': message.guild.name,
			'guildIcon': message.guild.icon,
			'channelId': message.channel.id,
			'channelName': message.channel.name,
			'messageId': message.id,
			'content': message.cleanContent,
			'x-userGlobal_name': message.author.globalName,
			'hm-globalName': message.author.globalName
		};
		let displayAvatar = calculateUserDefaultAvatarIndex(message.author.id).toString();
		if (message.author.discriminator !== '0' && message.author.discriminator !== '0000') {
			displayAvatar = (Number(message.author.discriminator) % 5).toString();
		}
		if (!message.author.avatar) {
			data['aq-defaultAvatar'] = displayAvatar;
		}

		const repo = dataSource.getRepository(SuperGlobalChatData);

		if (message.reference && message.reference.messageId) {
			let jsonData = await repo.findOne({ where: { sendIds: JsonArrayContains(message.reference.messageId) } });
			if (!jsonData) {
				jsonData = await repo.findOne({ where: { messageId: message.reference.messageId } });
			}
			if (jsonData) {
				data['reference'] = jsonData.messageId;
			}
		}

		if (message.attachments.size > 0) {
			data['attachmentsUrl'] = message.attachments.map((data) => data.url);
		}
		const regexMatchesAll = Object.values(constants.regexs.inviteUrls).some((regex) => regex.test(data.content));
		if (regexMatchesAll) {
			return false;
		}
		return JSON.stringify(data).replace(/\\\\/g, '\\');
	}
	async sgcChannel(channelId: string) {
		const manager = new SettingManager({ channelId });
		const channel = await manager.getChannel();
		if (!channel || (channel && !channel.superGlobal)) {
			return false;
		} else {
			return true;
		}
	}
	embedFromReference(data: MessageData, editData?: EditData) {
		let splitContent = data.content.slice(0, 1900);
		if (editData) {
			splitContent = editData.content.slice(0, 1900);
		}
		if (data.content !== splitContent) {
			splitContent = `${splitContent}...(メッセージ省略)`;
		}
		const embed = replyEmbed(
			splitContent,
			undefined,
			undefined,
			miniUserFormat(data.userName, data.userDiscriminator, data['x-userGlobal_name'] ?? data['hm-globalName'])
		);
		return embed;
	}
	messageGenerate(messages: MessageManager, byBot: boolean, byIsMy: boolean, by: string, data: MessageData) {
		const formatedName = miniUserFormat(
			data.userName,
			data.userDiscriminator,
			data['x-userGlobal_name'] ?? data['hm-globalName']
		);

		let firstIconInt = calculateUserDefaultAvatarIndex(data.userId);
		if (data.userDiscriminator !== '0' && data.userDiscriminator !== '0000') {
			firstIconInt = Number(data.userDiscriminator) % 5;
		}
		const userLabel = byBot ? '' : '<ユーザー>';
		const senderLabel = data.isBot ? '<アプリ>' : '';
		const byLabel = byIsMy ? '' : ` | ${by}${userLabel} 経由`;
		const sendData: MessagePayload | WebhookMessageCreateOptions = {
			username: `${formatedName} (id: ${data.userId}${senderLabel})${byLabel}`,
			avatarURL: getIconUrl(data.userId, data.userAvatar, firstIconInt)
		};

		if (data.attachmentsUrl && Array.isArray(data.attachmentsUrl) && data.attachmentsUrl.length > 0) {
			sendData['files'] = data.attachmentsUrl;
		}

		sendData['content'] = data.content;
		const splitContent = sendData['content'].slice(0, 1900);
		if (sendData['content'] !== splitContent) {
			sendData['content'] = `${splitContent}...(メッセージ省略)`;
		}
		const referenceId = data.reference;
		if (referenceId) {
			try {
				dataSource.transaction(async (em) => {
					const repo = em.getRepository(SuperGlobalChatData);
					const referenceData = await repo.findOne({ where: { messageId: referenceId } });
					if (referenceData) {
						try {
							const referenceJsonData = await messages.fetch(referenceData.id);
							if (referenceJsonData) {
								if (referenceData.editId) {
									const referenceEditJsonData = await messages.fetch(referenceData.editId);
									if (referenceEditJsonData) {
										sendData['embeds'] = [
											this.embedFromReference(
												JSON.parse(referenceJsonData.content),
												JSON.parse(referenceEditJsonData.content)
											)
										];
									} else {
										sendData['embeds'] = [this.embedFromReference(JSON.parse(referenceJsonData.content))];
									}
								} else {
									sendData['embeds'] = [this.embedFromReference(JSON.parse(referenceJsonData.content))];
								}
							}
						} catch (error) {
							if (error instanceof DiscordAPIError) {
								return;
							} else {
								Logger.error(error);
							}
						}
					}
				});
			} catch (error) {
				Logger.error(error);
			}
		}
		const allowedMentions = data['x-allowed_mentions'];
		if (allowedMentions) {
			const allowedMentionData: MessageMentionOptions = {};
			if (allowedMentions.parse) {
				allowedMentionData['parse'] = allowedMentions.parse;
			}
			if (allowedMentions.roles) {
				allowedMentionData['roles'] = allowedMentions.roles;
			}
			if (allowedMentions.users) {
				allowedMentionData['users'] = allowedMentions.users;
			}
			if (allowedMentions.replied_user) {
				allowedMentionData['repliedUser'] = allowedMentions.replied_user;
			}
			sendData['allowedMentions'] = allowedMentionData;
		}

		return sendData;
	}
	async messageEvent(emoji: EmojiData, data: MessageData, message: Message<true>) {
		const sendByNotMy = message.author.id !== message.client.user.id;
		const globalChat = new GlobalChatOnMessage();
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSettings = await repo.find({ where: { channelId: Not(message.channelId), superGlobal: true } });
		const messageIds: string[] = [];
		const regexMatchesAll = Object.values(constants.regexs.inviteUrls).some((regex) => regex.test(data.content));
		if (regexMatchesAll) {
			if (sendByNotMy) {
				return await message.react(emoji.no);
			} else {
				return;
			}
		}
		const messageData = this.messageGenerate(
			message.channel.messages,
			message.author.bot,
			message.author.id === message.client.user.id,
			message.author.username,
			data
		);
		for (const channelData of channelSettings) {
			const channelId = channelData.channelId;
			if (channelData.channelId === data.channelId) {
				continue;
			}
			const channel = message.client.channels.cache.get(channelId);
			if (
				!channel ||
				(channel && !channel.isSendable()) ||
				channel.isDMBased() ||
				channel.type === ChannelType.GuildStageVoice
			) {
				continue;
			}
			const webhook = await getWebhook(channel);
			const webhookCheck = globalChat.webhookErrorEmbed(webhook);
			if (webhookCheck) {
				await globalChat.remoteFail(webhookCheck, channel);
				continue;
			}

			const sendMessage = await (webhook as Webhook<WebhookType.Incoming>).send(messageData);
			messageIds.push(sendMessage.id);
		}
		try {
			dataSource.transaction(async (em) => {
				const repo = em.getRepository(SuperGlobalChatData);
				if (data.messageId) {
					const registData = new SuperGlobalChatData(message.id, data.messageId, messageIds);
					if (data.reference) {
						const referenceData = await repo.findOne({ where: { messageId: data.reference } });
						if (referenceData) {
							registData.replyId = referenceData.id;
							await repo.save(referenceData);
						}
					}
					await repo.save(registData);
				}
			});
		} catch (error) {
			Logger.error(error);
			if (sendByNotMy) {
				return await message.react(emoji.no);
			} else {
				return;
			}
		}
		if (sendByNotMy) {
			return await message.react(emoji.check);
		} else {
			return;
		}
	}
	async dataListen(message: Message<true>) {
		const emoji = emojis();
		try {
			const jsonData = JSON.parse(message.content) as BaseData;
			if (this.isMessageData(jsonData)) {
				return await this.messageEvent(emoji, jsonData, message);
			} else if (jsonData.type === 'edit') {
				return await message.react(emoji.check);
			} else if (jsonData.type === 'delete') {
				return await message.react(emoji.check);
			} else if (jsonData.type === 'empty') {
				return await message.react(emoji.check);
			} else {
				return;
			}
		} catch {
			return await message.react(emoji.no);
		}
	}
	async messageListen(message: Message<true>) {
		const emoji = emojis();
		const globalChat = new GlobalChatOnMessage();
		if (message.author.id === message.client.user.id) {
			return;
		}
		if (webhookChecker(message.author.discriminator)) {
			return;
		}
		if (message.author.system || message.author.bot) {
			return await message.react(emoji.no);
		}

		const channel = message.channel;
		if (channel.isDMBased() || channel.type === ChannelType.GuildStageVoice || channel.isThread()) {
			return await globalChat.fail(
				failEmbed('スーパーグローバルチャットに非対応なチャンネルです', '使用不可'),
				message
			);
		}

		const repo = dataSource.getRepository(GlobalChatBan);
		const block = await repo.findOne({ where: { id: message.author.id } });
		if (block) {
			return await globalChat.fail(
				failEmbed(`あなたは送信ブロック処置がされています\n**理由**\n${block.reason}`, '送信不可'),
				message
			);
		}

		const webhook = await getWebhook(channel);
		const embed = globalChat.webhookErrorEmbed(webhook);

		if (embed) {
			return await globalChat.fail(embed, message);
		}
		const regexMatchesAll = Object.values(constants.regexs.inviteUrls).some((regex) =>
			regex.test(message.cleanContent.replace(/\\\\/g, '\\'))
		);
		if (regexMatchesAll) {
			return await globalChat.fail(failEmbed('メッセージに招待リンクが含まれています', '送信不可'), message);
		}
		const data = await this.dataGenerate(message);
		const sgcChannel = message.client.channels.cache.get(config.sgcJsonChannel);
		if (!sgcChannel || (sgcChannel && !sgcChannel.isSendable())) {
			return await message.react(emoji.no);
		}
		if (data === false) {
			return await globalChat.fail(failEmbed('メッセージに招待リンクが含まれています', '送信不可'), message);
		} else {
			await sgcChannel.send(data);
			return await message.react(emoji.check);
		}
	}
	async execute(message: Message<true>) {
		if (message.channel.id === config.sgcJsonChannel) {
			return await this.dataListen(message);
		}
		const superGlobal = await this.sgcChannel(message.channelId);
		if (superGlobal) {
			await this.messageListen(message);
		}
		return;
	}
}
