/* eslint-disable unicorn/no-nested-ternary */
import { ChannelType, Events, Message, Webhook } from 'discord.js';

export default {
	name: Events.MessageDelete,
	once: false,
	async execute(message: Message) {
		const user = message.author;

		if (user.bot || user.system || user.discriminator === '0000') return;
		if (message.channel.type !== ChannelType.GuildText) return;
		if (!(await message.client.botData.globalChat.register.get(message.channelId))) return;

		const messages: undefined | { channelId: string; messageId: string }[] =
			await message.client.botData.globalChat.messages.get(message.id);
		for (const value of messages) {
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
	},
};
