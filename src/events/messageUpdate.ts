import {
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	EmbedBuilder,
	Events,
	Message,
	MessageType,
	Webhook,
} from 'discord.js';
import { avatarUrl, files, inviteUrls, sender, stickerEmbeds, truncateContent } from '../messages/globalChat.js';
import { MessageEditData } from '../utils/SuperGlobalChatType.js';
import { userFormat } from '../utils/userFormat.js';
async function dissoku(newMessage: Message) {
	if (!(await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId))) return;
	if (newMessage.author.id !== '761562078095867916') return;
	if (
		newMessage.embeds[0] &&
		newMessage.embeds[0].fields[0] &&
		newMessage.embeds[0].fields[0].name.includes('をアップしたよ!')
	) {
		if (newMessage.channel.type === ChannelType.GuildText)
			newMessage.channel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('UPしました！')
						.setDescription(`<t:${Math.floor(Date.now() / 1000) + 7200}:F> にお知らせします。`)
						.setColor(Colors.Blue),
				],
			});
		setTimeout(async () => {
			const role = await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId + '_role');
			if (role) {
				if (newMessage.channel.type === ChannelType.GuildText)
					newMessage.channel.send({
						content: `<@&${role}>`,
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</up:1363739182672904354> でupできます。')
								.setColor(Colors.Blue),
						],
						allowedMentions: { parse: ['roles'] },
					});
			} else {
				if (newMessage.channel.type === ChannelType.GuildText)
					newMessage.channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</up:1363739182672904354> でupできます。')
								.setColor(Colors.Blue),
						],
					});
			}
		}, 7_200_000);
	}
}
async function globalChat(message: Message) {
	const user = message.author;
	const channel = message.channel;
	const { register, messages, messageIndex } = message.client.botData.newGlobalChat;
	const registed = Boolean(await register.get(channel.id));

	// 未登録のチャンネルの場合は無視する
	if (!registed) {
		return;
	}
	// チャンネルがテキストチャンネルでない場合は無視する
	if (channel.type !== ChannelType.GuildText) return;
	// Bot / System / Webhook のメッセージを無視する
	if (user.bot || user.system || user.discriminator === '0000') return;

	try {
		const inviteDetected = [
			inviteUrls.dicoall,
			inviteUrls.disboard,
			inviteUrls.discoparty,
			inviteUrls.discord,
			inviteUrls.discordCafe,
			inviteUrls.dissoku,
			inviteUrls.sabach,
			inviteUrls.distopia,
		].some((regex) => regex.test(message.cleanContent.toLowerCase()));

		if (inviteDetected) return;

		const embeds = stickerEmbeds(message.stickers);
		let button: ButtonBuilder | undefined = undefined;
		let repliedMessageId: string | undefined = undefined;

		if (message.type === MessageType.Reply) {
			const repliedMessage = await message.fetchReference();

			repliedMessageId = repliedMessage.id;
			embeds.push(
				new EmbedBuilder()
					.setColor(Colors.Blue)
					.setAuthor({
						name: userFormat(repliedMessage.author),
						iconURL: avatarUrl(repliedMessage.author),
					})
					.setDescription(truncateContent(repliedMessage.cleanContent)),
			);

			button = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('返信元メッセージ');
		}

		await sender(
			register,
			messages,
			messageIndex,
			{
				content: truncateContent(message.cleanContent),
				avatarURL: avatarUrl(message.author),
				embeds,
				files: files(message.attachments),
				username: userFormat(message.author),
				allowedMentions: { parse: [] },
			},
			message,
			button,
			true,
			repliedMessageId,
		);
		message.react('✅');
	} catch (error) {
		console.error(error);
	}
}
async function superGlobalChat(newMessage: Message) {
	const user = newMessage.author;

	if (user.bot || user.system || user.discriminator === '0000') return;
	if (newMessage.channel.type !== ChannelType.GuildText) return;
	if (!(await newMessage.client.botData.superGlobalChat.register.get(newMessage.channelId))) return;
	const msgs: undefined | { channelId: string; messageId: string }[] =
		await newMessage.client.botData.superGlobalChat.messages.get(newMessage.id);
	for (const value of msgs) {
		const channel = newMessage.client.channels.cache.get(value.channelId);
		if (!channel) continue;
		if (channel.type !== ChannelType.GuildText) continue;
		const webhooks = await channel.fetchWebhooks();
		const webhook: Webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued').owner.id !== newMessage.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		const content =
			newMessage.content.slice(0, 1500) === newMessage.content
				? newMessage.content
				: `${newMessage.content.slice(0, 1500)}...`;
		webhook.editMessage(value.messageId, {
			content: content,
		});
	}
	const channel = newMessage.client.channels.cache.get(newMessage.client.botData.sgcJsonChannelId);
	if (channel && channel.type === ChannelType.GuildText) {
		if (newMessage.channel.type !== ChannelType.GuildText) return;
		const data: MessageEditData = { type: 'edit', messageId: newMessage.id, content: newMessage.content };
		channel.send(JSON.stringify(data));
	}
}
export default {
	name: Events.MessageUpdate,
	once: false,
	async execute(oldMessage: Message, newMessage: Message) {
		await dissoku(newMessage);
		await globalChat(newMessage);
		await superGlobalChat(newMessage);
	},
};
