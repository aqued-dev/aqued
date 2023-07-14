/* eslint-disable unicorn/no-nested-ternary */
import { Message, ChannelType, Webhook, Colors, EmbedBuilder, SnowflakeUtil } from 'discord.js';
import { EmptyData, MessageData, MessageDeleteData, MessageEditData } from '../utils/SuperGlobalChatType.js';
import { calculateUserDefaultAvatarIndex } from '@discordjs/rest';
import { inspect } from 'node:util';

export default async function (message: Message) {
	try {
		const jsonChannelId = message.client.botData.sgcJsonChannelId;
		const jsonChannelIdv2 = message.client.botData.sgcJsonChannelIdv2;
		if (message.channelId !== jsonChannelId && message.channelId !== jsonChannelIdv2) return;
		if (message.author.id === message.client.user.id) return;
		const replyMessages = message.client.botData.superGlobalChat.replyMessages;
		const registers = await message.client.botData.superGlobalChat.register.keys();
		const data: MessageData | MessageDeleteData | MessageEditData | EmptyData = JSON.parse(message.content);
		switch (data.type) {
			case 'message': {
				await replyMessages.set(data.messageId, { content: data.content, id: message.id });

				for (const value of registers) {
					const channel = message.client.channels.cache.get(value);
					if (!channel) return;
					if (channel.id === message.channelId) return;
					if (channel.type !== ChannelType.GuildText) return;
					const webhooks = await channel.fetchWebhooks();
					const webhook: Webhook =
						!webhooks.some((value) => value.name === 'Aqued') ||
						webhooks.find((value) => value.name === 'Aqued').owner.id !== message.client.user.id
							? await channel.createWebhook({ name: 'Aqued' })
							: webhooks.find((value) => value.name === 'Aqued');
					const files = data.attachmentsUrl ?? [];
					let replymsg: string;
					if (data.reference) {
						const repliedMessage: { content: string; id: string } | undefined =
							await message.client.botData.superGlobalChat.replyMessages.get(data.reference);
						if (!repliedMessage) return;
						replymsg = repliedMessage.content;
						if (replymsg.includes('\n')) {
							replymsg = replymsg.slice(replymsg.indexOf('\n'));
						}
					}
					const content =
						data.content.slice(0, 1500) === data.content ? data.content : `${data.content.slice(0, 1500)}...`;
					webhook
						.send({
							files,
							username: `${data.userName}${data.userDiscriminator === '0' ? '' : `#${data.userDiscriminator}`}(id: ${
								data.userId
							}) | ${message.author.username} 経由`,
							content: data.reference
								? replymsg.replaceAll('\n', ' ').replaceAll('> ', '').slice(0, 15) ===
								  replymsg.replaceAll('\n', ' ').replaceAll('> ', '')
									? `> ${replymsg.replaceAll('\n', ' ').replaceAll('> ', '')}\n${content}`
									: `> ${replymsg.replaceAll('\n', ' ').replaceAll('> ', '').slice(0, 15)}...\n${content}`
								: content,
							avatarURL: data.userAvatar
								? `${message.client.rest.cdn.avatar(data.userId, data.userAvatar, { extension: 'webp' })}`
								: `${this.client.rest.cdn.defaultAvatar(
										this.discriminator === '0'
											? calculateUserDefaultAvatarIndex(message.author.id)
											: Number(message.author.discriminator) % 5,
								  )}`,
						})
						.then(async (value) => {
							const array: { channelId: string; messageId: string }[] =
								(await message.client.botData.superGlobalChat.messages.get(data.messageId)) || [];
							array.push({
								channelId: value.channelId,
								messageId: value.id,
							});
							await message.client.botData.superGlobalChat.messages.set(data.messageId, array);
							await message.client.botData.superGlobalChat.replyMessages.set(value.id, {
								content: message.content,
								id: data.messageId,
							});
						});
				}
				message.react('✅');

				break;
			}
			case 'edit': {
				const msgs: undefined | { channelId: string; messageId: string }[] =
					await message.client.botData.superGlobalChat.messages.get(data.messageId);
				for (const value of msgs) {
					const channel = message.client.channels.cache.get(value.channelId);
					if (!channel) continue;
					if (channel.type !== ChannelType.GuildText) continue;
					const webhooks = await channel.fetchWebhooks();
					const webhook: Webhook =
						!webhooks.some((value) => value.name === 'Aqued') ||
						webhooks.find((value) => value.name === 'Aqued').owner.id !== message.client.user.id
							? await channel.createWebhook({ name: 'Aqued' })
							: webhooks.find((value) => value.name === 'Aqued');

					const content =
						data.content.slice(0, 1500) === data.content ? data.content : `${data.content.slice(0, 1500)}...`;
					webhook.editMessage(value.messageId, {
						content: content,
					});
				}
				message.react('✅');

				break;
			}
			case 'delete': {
				const msgs: undefined | { channelId: string; messageId: string }[] =
					await message.client.botData.superGlobalChat.messages.get(data.messageId);
				for (const value of msgs) {
					const channel = message.client.channels.cache.get(value.channelId);
					if (!channel) continue;
					if (channel.type !== ChannelType.GuildText) continue;
					const webhooks = await channel.fetchWebhooks();
					const webhook: Webhook =
						!webhooks.some((value) => value.name === 'Aqued') ||
						webhooks.find((value) => value.name === 'Aqued').owner.id !== message.client.user.id
							? await channel.createWebhook({ name: 'Aqued' })
							: webhooks.find((value) => value.name === 'Aqued');

					webhook.deleteMessage(value.messageId);
				}
				message.react('✅');
				break;
			}
		}
	} catch (error) {
		console.error(error);
		const errorId = SnowflakeUtil.generate();

		message.client.botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));

		const Errorchannel = message.client.channels.cache.get(message.client.botData.errorChannelId);
		if (Errorchannel.isTextBased())
			Errorchannel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(':x: エラーが発生しました。')
						.setDescription(`Id: ${errorId.toString()}`)
						.setColor(Colors.Red),
				],
			});
		message.react('❌');
		return;
	}
}
