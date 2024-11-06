import {
	ChannelType,
	Events,
	Message,
	Webhook,
	WebhookType,
	type OmitPartialGroupDMChannel,
	type PartialMessage
} from 'discord.js';
import { Not } from 'typeorm';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { GlobalChatMessage } from '../../database/entities/GlobalChatMessage.js';
import { getWebhook } from '../../utils/getWebhook.js';
import GlobalChatOnMessage from './onMessage.js';

export default class GlobalChatOnDelete implements EventListener<Events.MessageDelete> {
	public name: Events.MessageDelete;
	public once: boolean;
	constructor() {
		this.name = Events.MessageDelete;
		this.once = false;
	}
	async execute(message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>): Promise<unknown> {
		const util = new GlobalChatOnMessage();
		const beforeCheck = await util.beforeCheck(message);
		if (!beforeCheck) {
			return;
		}
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSettings = await repo.find({ where: { channelId: Not(message.channelId) } });
		if (channelSettings.length === 0) {
			return;
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
				continue;
			}
			await (webhook as Webhook<WebhookType.Incoming>).deleteMessage(globalMessage.messageId);
		}
		return;
	}
}
