import { ChannelType, Events, Message, Webhook, WebhookType } from 'discord.js';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { GlobalChatBan } from '../../database/entities/GlobalChatBan.js';
import { GlobalChatMessage } from '../../database/entities/GlobalChatMessage.js';
import { getWebhook } from '../../utils/getWebhook.js';
import GlobalChatOnMessage from '../globalChat/onMessage.js';
export default class MessageCreate implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async execute(message: Message) {
		if (message.client.aqued.config.bot.admins.includes(message.author.id)) {
			if (message.content.startsWith('aq.gchat delete')) {
				const mid = message.content.replace('aq.gchat delete ', '');
				const util = new GlobalChatOnMessage();
				const globalChatMessageRepo = dataSource.getRepository(GlobalChatMessage);
				const globalChatMessage = await globalChatMessageRepo.findOne({ where: { id: mid } });
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
				await message.react('✅');
			} else if (message.content.startsWith('aq.gchat ban')) {
				const userId = message.content.replace('aq.gchat ban ', '').split(' ');
				const repo = dataSource.getRepository(GlobalChatBan);
				await repo.insert({ id: userId[0] ?? '', reason: userId[1] ?? 'なし' });
				await message.react('✅');
			} else if (message.content.startsWith('aq.gchat unban')) {
				const userId = message.content.replace('aq.gchat unban ', '');
				const repo = dataSource.getRepository(GlobalChatBan);
				await repo.delete(userId);
				await message.react('✅');
			}
		}
	}
}
