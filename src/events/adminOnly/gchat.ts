import { ChannelType, DiscordAPIError, Events, Message, Webhook, WebhookType } from 'discord.js';
import { Not } from 'typeorm';
import { fileURLToPath } from 'url';
import { emojis } from '../../config/emojis.js';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { ChannelSetting } from '../../database/entities/ChannelSetting.js';
import { GlobalChatBan } from '../../database/entities/GlobalChatBan.js';
import { GlobalChatMessage, GlobalChatMessages } from '../../database/entities/GlobalChatMessage.js';
import { failEmbed } from '../../embeds/infosEmbed.js';
import { errorReport } from '../../utils/errorReporter.js';
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
		const emoji = emojis();
		if (message.client.aqued.config.bot.admins.includes(message.author.id)) {
			if (message.content.startsWith('aq.gchat delete')) {
				let warn = false;
				const mid = message.content.replace('aq.gchat delete ', '');
				const util = new GlobalChatOnMessage();
				const globalChatMessageRepo = dataSource.getRepository(GlobalChatMessage);
				const globalChatMessage = await globalChatMessageRepo.findOne({ where: { id: mid } });
				if (!globalChatMessage) {
					const repo = dataSource.getRepository(GlobalChatMessage);
					const data: { id: string; channelId: string; guildId: string; messages: GlobalChatMessages[] }[] =
						await repo.query(`SELECT * FROM GLOBAL_CHAT_MESSAGE WHERE JSON_SEARCH(messages, 'one', ?) IS NOT NULL`, [
							mid
						]);
					if (!data || !data[0] || (data[0] && !data[0].messages)) {
						return;
					}
					for (const globalMessage of data[0].messages) {
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
						try {
							await (webhook as Webhook<WebhookType.Incoming>).deleteMessage(globalMessage.messageId);
						} catch (error) {
							if (error instanceof DiscordAPIError) {
								warn = true;
							} else {
								const errorId = errorReport(
									fileURLToPath(import.meta.url),
									message.channel,
									message.author,
									error,
									'aq.gchat delete'
								);
								await message.reply({
									embeds: [
										failEmbed(
											`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
										)
									]
								});
								warn = true;
							}
						}
					}
					return await message.react(warn ? emoji.warn : emoji.check);
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
					try {
						await (webhook as Webhook<WebhookType.Incoming>).deleteMessage(globalMessage.messageId);
					} catch (error) {
						if (error instanceof DiscordAPIError) {
							warn = true;
						} else {
							const errorId = errorReport(
								fileURLToPath(import.meta.url),
								message.channel,
								message.author,
								error,
								'aq.gchat delete'
							);
							await message.reply({
								embeds: [
									failEmbed(
										`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
									)
								]
							});
							warn = true;
						}
					}
				}
				return await message.react(warn ? emoji.warn : emoji.check);
			} else if (message.content.startsWith('aq.gchat ban')) {
				const userId = message.content.replace('aq.gchat ban ', '').split(' ');
				const repo = dataSource.getRepository(GlobalChatBan);
				await repo.insert({ id: userId[0] ?? '', reason: userId[1] ?? 'なし' });
				return await message.react(emoji.check);
			} else if (message.content.startsWith('aq.gchat unban')) {
				const userId = message.content.replace('aq.gchat unban ', '');
				const repo = dataSource.getRepository(GlobalChatBan);
				await repo.delete(userId);
				return await message.react(emoji.check);
			} else if (message.content.startsWith('aq.gchat system')) {
				const base = new GlobalChatOnMessage();
				const content = message.content.replace('aq.gchat system ', '');
				const repo = dataSource.getRepository(ChannelSetting);
				const channelSettings = await repo.find({ where: { channelId: Not(message.channelId) } });
				if (channelSettings.length === 0) {
					return await base.fail(
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
					const webhookCheck = base.webhookErrorEmbed(webhook);
					if (webhookCheck) {
						await base.remoteFail(webhookCheck, channel);
						continue;
					}
					await (webhook as Webhook<WebhookType.Incoming>).send({
						content,
						username: 'Aqued System',
						avatarURL: message.client.user.displayAvatarURL({ extension: 'webp' })
					});
				}
				return await message.react(emoji.check);
			}
		}
		return;
	}
}
