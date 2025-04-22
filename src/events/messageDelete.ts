import { ChannelType, Events, Message } from 'discord.js';
import { MessageDeleteData } from '../utils/SuperGlobalChatType.js';
async function gchat(message: Message) {
	const user = message.author;

	if (user.bot || user.system || user.discriminator === '0000') {
		return;
	}
	if (message.channel.type !== ChannelType.GuildText) {
		return;
	}
	if (!(await message.client.botData.globalChat.register.get(message.channelId))) {
		return;
	}

	const messages: undefined | { channelId: string; messageId: string }[] =
		await message.client.botData.globalChat.messages.get(message.id);
	if (!messages) {
		return;
	}
	for (const value of messages) {
		const channel = message.client.channels.cache.get(value.channelId);
		if (!channel) {
			continue;
		}
		if (channel.type !== ChannelType.GuildText) {
			continue;
		}
		const webhooks = await channel.fetchWebhooks();
		const webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== message.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		webhook?.deleteMessage(value.messageId);
	}
}
async function sgc(message: Message) {
	const user = message.author;

	if (user.bot || user.system || user.discriminator === '0000') {
		return;
	}
	if (message.channel.type !== ChannelType.GuildText) {
		return;
	}
	if (!(await message.client.botData.superGlobalChat.register.get(message.channelId))) {
		return;
	}

	const messages: undefined | { channelId: string; messageId: string }[] =
		await message.client.botData.superGlobalChat.messages.get(message.id);
	if (!messages) {
		return;
	}
	for (const value of messages) {
		const channel = message.client.channels.cache.get(value.channelId);
		if (!channel) {
			continue;
		}
		if (channel.type !== ChannelType.GuildText) {
			continue;
		}
		const webhooks = await channel.fetchWebhooks();
		const webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== message.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		webhook?.deleteMessage(value.messageId);
	}
	const channel = message.client.channels.cache.get(message.client.botData.sgcJsonChannelId);
	if (channel && channel.type === ChannelType.GuildText) {
		const data: MessageDeleteData = { type: 'delete', messageId: message.id };
		channel.send(JSON.stringify(data));
	}
}
export default {
	name: Events.MessageDelete,
	once: false,
	async execute(message: Message) {
		await gchat(message);
		await sgc(message);
	},
};
