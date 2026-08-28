import { ChannelType, Events, Message, Webhook, WebhookClient } from 'discord.js';
import { MessageDeleteData } from '../utils/SuperGlobalChatType.js';

async function gchat(message: Message) {
	const user = message.author;
	const channel = message.channel;
	const { register, messages } = message.client.botData.newGlobalChat;
	const registed = Boolean(await register.get(channel.id));

	// 未登録のチャンネルの場合は無視する
	if (!registed) {
		return;
	}
	// チャンネルがテキストチャンネルでない場合は無視する
	if (channel.type !== ChannelType.GuildText) return;
	// Bot / System / Webhook のメッセージを無視する
	if (user.bot || user.system || user.discriminator === '0000') return;

	const registers = await register.list();

	for (const registedData of registers) {
		const key = registedData.key;
		const value = registedData.value;

		if (key === channel.id) continue;

		const webhook = new WebhookClient({ id: value.webhook.id, token: value.webhook.token });

		const messageData = await messages.get(message.id);
		const relayMessage = messageData?.relays?.find((d) => d.channelId === key);
		if (!relayMessage) continue;

		await webhook.deleteMessage(relayMessage.id);
	}
	await messages.delete(message.id);
}
async function sgc(message: Message) {
	const user = message.author;

	if (user.bot || user.system || user.discriminator === '0000') return;
	if (message.channel.type !== ChannelType.GuildText) return;
	if (!(await message.client.botData.superGlobalChat.register.get(message.channelId))) return;

	const messages: undefined | { channelId: string; messageId: string }[] =
		await message.client.botData.superGlobalChat.messages.get(message.id);
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
