import { calculateUserDefaultAvatarIndex, ChannelType, Events, Message, Snowflake } from 'discord.js';
import { config } from '../config/config.js';
import { constants } from '../config/constants.js';
import { emojis } from '../config/emojis.js';
import { Logger } from '../core/Logger.js';
import { SettingManager } from '../core/SettingManager.js';
import { dataSource } from '../core/typeorm.config.js';
import { EventListener } from '../core/types/EventListener.js';
import { GlobalChatBan } from '../database/entities/GlobalChatBan.js';
import { failEmbed } from '../embeds/infosEmbed.js';
import { getWebhook } from '../utils/getWebhook.js';
import { webhookChecker } from '../utils/webhookChecker.js';
import GlobalChatOnMessage from './globalChat/onMessage.js';
interface MessageData {
	/**
	 * データの種類(必須)
	 */
	'type': 'message';
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

export default class SuperGlobalChatOnMessage implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	dataGenerate(message: Message<true>) {
		const data: MessageData = {
			'type': 'message',
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
			'content': message.content,
			'x-userGlobal_name': message.author.globalName,
			'hm-globalName': message.author.globalName
		};
		const matches = message.content.match(constants.regexs.customEmoji);
		let displayAvatar = calculateUserDefaultAvatarIndex(message.author.id).toString();
		if (message.author.discriminator !== '0' && message.author.discriminator !== '0000') {
			displayAvatar = (Number(message.author.discriminator) % 5).toString();
		}
		if (!message.author.avatar) {
			data['aq-defaultAvatar'] = displayAvatar;
		}
		if (matches) {
			const emojis = matches.map((emoji) => {
				const data = emoji.match(constants.regexs.customEmoji);
				if (!data) {
					return;
				}
				const [, animated, name, id] = data as [string, string, string, string];
				return {
					animated: animated === 'a' ? true : false,
					name,
					id,
					url: `${constants.cdnEmojiFormated}\\/${id}.${animated === 'a' ? 'gif' : 'png'}`
				};
			});
			data['rin-emojis'] = emojis
				.filter((emoji) => emoji !== undefined)
				.reduce((acc: Record<string, string>, emoji) => {
					acc[`${emoji.animated ? 'a' : ''}:${emoji.name}:`] = emoji.url;
					return acc;
				}, {});
		}
		return JSON.stringify(data);
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
	async dataListen(message: Message<true>) {
		if (message.author.id === message.client.user.id) {
			return;
		}
		Logger.info(message.content);
		// const jsonData = JSON.parse(message.content);
	}
	async messageListen(message: Message<true>) {
		const emoji = emojis();
		const globalChat = new GlobalChatOnMessage();
		if (message.author.system || message.author.bot) {
			return await message.react(emoji.no);
		}
		if (webhookChecker(message.author.discriminator)) {
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
			return await globalChat.fail(failEmbed('メッセージに招待リンクが含まれています', '送信不可'), message);
		}

		// データ送信部
		const data = this.dataGenerate(message);
		const sgcChannel = message.client.channels.cache.get(config.sgcJsonChannel);
		if (!sgcChannel || (sgcChannel && !sgcChannel.isSendable())) {
			return await message.react(emoji.no);
		}
		await sgcChannel.send(data.replace(/\\\\/g, '\\'));

		return await message.react(emoji.check);
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
