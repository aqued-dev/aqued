import { ChannelType, Events, Message } from 'discord.js';
import { SettingManager } from '../../core/SettingManager.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { getWebhook, WebhookStatus } from '../../utils/getWebhook.js';
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
	async execute(message: Message) {
		const settings = new SettingManager({ channelId: message.channelId });
		const setting = await settings.getChannel();

		if (!setting) return;
		if (!setting.globalChat) return;

		const channel = message.channel;
		if (channel.isDMBased() || channel.type === ChannelType.GuildStageVoice || channel.isThread()) {
			return await message.reply('このチャンネルではグローバルチャットはご利用いただけません');
		}

		const webhook = await getWebhook(channel);

		// Webhookが取得出来ない場合
		if (webhook === WebhookStatus.UnknownError) {
			return await message.reply('不明なエラーが発生しました');
		} else if (webhook === WebhookStatus.PermissionError) {
			return await message.reply('権限不足。Aquedにウェブフックの管理権限を付与してください');
		} else if (webhook === WebhookStatus.ParentChannel) {
			return await message.reply('スレッド親チャンネルなし');
		}
		return;
	}
}
