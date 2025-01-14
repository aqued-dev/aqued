import { AttachmentBuilder, Channel, SnowflakeUtil, User, WebhookClient } from 'discord.js';
import { inspect } from 'node:util';
import { config } from '../config/config.js';
import { Logger } from '../core/Logger.js';
import { dataSource } from '../core/typeorm.config.js';
import { Error } from '../database/entities/Error.js';
import { failEmbed } from '../embeds/infosEmbed.js';
import { translateChannelType } from './translateChannelType.js';
import { userFormat } from './userFormat.js';
export function createMessageUrl(guildId: string, channelId: string, messageId: string) {
	return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}
/**
 * エラーを開発者に報告します。
 * @param filePath ファイルパス
 * @param channel エラー発生チャンネル
 * @param user エラー発生ユーザー
 * @param error エラー
 * @param commandName コマンド名
 * @param eventName イベント名
 * @param customId カスタムID
 * @returns エラーID
 */
export async function errorReport(
	filePath: string,
	channel: Channel,
	user: User,
	error: unknown,
	commandName: string = '',
	eventName: string = '',
	customId: string = ''
): Promise<string> {
	const threadId = config.loggerThreadId;
	const webhook = new WebhookClient(config.loggerWebhook);
	const baseLog = inspect(error);
	const attachment = new AttachmentBuilder(Buffer.from(baseLog)).setName('error.js');
	const id = SnowflakeUtil.generate().toString();
	const description = [
		`**エラーID: ${id}**`,
		`ユーザー名: ${userFormat(user)}`,
		`ユーザーID: ${user.id}`,
		`チャンネル名: ${channel.isDMBased() ? 'DM' : channel.name}`,
		`チャンネルID: ${channel.id}`,
		`チャンネルの種類: ${translateChannelType([BigInt(channel.type)])}`,
		`ファイルパス: ${filePath}`,
		`コマンド名: ${commandName ?? 'なし'}`,
		`イベント名: ${eventName ?? 'なし'}`,
		`カスタムID: ${customId ?? 'なし'}`
	];
	const embed = failEmbed(description.join('\n'), 'エラー詳細');
	const message = await webhook.send({
		threadId,
		username: 'Aqued Error Reporter',
		embeds: [embed],
		files: [attachment]
	});
	dataSource.transaction(async (em) => {
		const repo = em.getRepository(Error);
		const newError = new Error(id, createMessageUrl(config.loggerGuildId, threadId, message.id));
		await repo.save(newError);
	});
	Logger.warn(baseLog);

	return id;
}
