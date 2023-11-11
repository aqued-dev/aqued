import { ChannelType, GuildMember, Message, User, Webhook } from 'discord.js';
import { ForcePinDataType } from '../utils/ForcePinDataType.js';
export default async function (message: Message) {
	if (message.author.discriminator === '0000') return;
	const { botData, channels, user, users } = message.client;
	const data: ForcePinDataType | null = await botData.forcePin.get(message.channelId);
	if (!data) return;
	if (message.channel.type !== ChannelType.GuildText) return;
	const webhooks = await message.channel.fetchWebhooks();
	const webhook: Webhook =
		!webhooks.some((value) => value.name === 'Aqued') ||
		webhooks.find((value) => value.name === 'Aqued').owner.id !== user.id
			? await message.channel.createWebhook({ name: 'Aqued' })
			: webhooks.find((value) => value.name === 'Aqued');
	const latestChannel = channels.cache.get(data.latestChannelId);
	if (!latestChannel) return;
	if (latestChannel.type !== ChannelType.GuildText) return;
	try {
		const message_ = await latestChannel.messages.fetch(data.latestMessageId);
		message_.delete();
	} catch {
		/* empty */
	}
	let user_: User | GuildMember = latestChannel.members.get(data.userId);
	if (!user_) user_ = users.cache.get(data.userId);
	user_
		? webhook
				.send({
					avatarURL: user_.extDefaultAvatarURL({ extension: 'webp' }),
					username: user_.displayName,
					embeds: data.embeds,
					content: data.content,
					files: data.attachments,
				})
				.then(async (message_) => {
					const setData: ForcePinDataType = {
						attachments: data.attachments,
						content: data.content,
						embeds: data.embeds,
						userId: data.userId,
						latestMessageId: message_.id,
						latestChannelId: message_.channelId,
					};
					await botData.forcePin.set(data.latestChannelId, setData);
				})
		: webhook
				.send({
					avatarURL: user_.extDefaultAvatarURL({ extension: 'webp' }),
					username: user_.displayName,
					embeds: data.embeds,
					content: data.content,
					files: data.attachments,
				})
				.then(async (message_) => {
					const setData: ForcePinDataType = {
						attachments: data.attachments,
						content: data.content,
						embeds: data.embeds,
						userId: data.userId,
						latestMessageId: message_.id,
						latestChannelId: message_.channelId,
					};
					await botData.forcePin.set(data.latestChannelId, setData);
				});
}
