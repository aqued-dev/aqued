import { ChannelType, Events, Message, Webhook, WebhookType } from 'discord.js';
import { Not } from 'typeorm';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { GlobalChatMessage } from '../../database/entities/GlobalChatMessage.js';
import { failEmbed } from '../../embeds/infosEmbed.js';
import { getWebhook } from '../../utils/getWebhook.js';
import GlobalChatOnMessage from './onMessage.js';

export default class GlobalChatOnEdit implements EventListener<Events.MessageUpdate> {
	public name: Events.MessageUpdate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageUpdate;
		this.once = false;
	}
	async execute(_oldMessage: Message<boolean>, message: Message<boolean>): Promise<unknown> {
		const util = new GlobalChatOnMessage();
		const beforeCheck = await util.beforeCheck(message);
		if (!beforeCheck) {
			return;
		}
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSettings = await repo.find({ where: { channelId: Not(message.channelId), globalChat: true } });
		if (channelSettings.length === 0) {
			return await util.fail(
				failEmbed('グローバルチャットに参加しているチャンネルが他に一つもありません', '編集不可'),
				message
			);
		}
		const globalChatMessageRepo = dataSource.getRepository(GlobalChatMessage);
		const globalChatMessage = await globalChatMessageRepo.findOne({ where: { id: message.id } });
		if (!globalChatMessage) {
			return;
		}

		for (const globalMessage of globalChatMessage.messages) {
			const channel = message.client.channels.cache.get(globalMessage.channelId);
			if (!channel) {
				continue;
			}
			if (!channel.isSendable() || channel.isDMBased() || channel.type === ChannelType.GuildStageVoice) {
				continue;
			}
			const webhook = await getWebhook(channel);
			const webhookCheck = util.webhookErrorEmbed(webhook);
			if (webhookCheck) {
				await util.remoteFail(webhookCheck, channel);
				continue;
			}
			const data = await util.messageInit(message, channel.guildId, channel.id);
			await (webhook as Webhook<WebhookType.Incoming>).editMessage(globalMessage.messageId, data);
		}
		return;
	}
}
