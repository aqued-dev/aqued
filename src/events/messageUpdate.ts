import {
	AttachmentBuilder,
	ChannelType,
	Colors,
	EmbedBuilder,
	Events,
	Message,
	MessageType,
	StickerFormatType,
} from 'discord.js';
import { MessageEditData } from '../utils/SuperGlobalChatType.js';
async function dissoku(newMessage: Message) {
	if (!(await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId!))) {
		return;
	}
	if (newMessage.author.id !== '761562078095867916') {
		return;
	}
	if (
		newMessage.embeds[0] &&
		newMessage.embeds[0].fields[0] &&
		newMessage.embeds[0].fields[0].value.includes('ActiveLevel')
	) {
		if (newMessage.channel.type === ChannelType.GuildText) {
			newMessage.channel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('UPしました！')
						.setDescription(`<t:${Math.floor(Date.now() / 1000) + 3600}:F> にお知らせします。`)
						.setColor(Colors.Blue),
				],
			});
		}
		setTimeout(async () => {
			const role = await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId + '_role');
			if (role) {
				if (newMessage.channel.type === ChannelType.GuildText) {
					newMessage.channel.send({
						content: `<@&${role}>`,
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</dissoku up:828002256690610256> でupできます。')
								.setColor(Colors.Blue),
						],
						allowedMentions: { parse: ['roles'] },
					});
				}
			} else {
				if (newMessage.channel.type === ChannelType.GuildText) {
					newMessage.channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</dissoku up:828002256690610256> でupできます。')
								.setColor(Colors.Blue),
						],
					});
				}
			}
		}, 3_600_000);
	}
}
async function globalChat(newMessage: Message) {
	const user = newMessage.author;

	if (user.bot || user.system || user.discriminator === '0000') {
		return;
	}
	if (newMessage.channel.type !== ChannelType.GuildText) {
		return;
	}
	if (!(await newMessage.client.botData.globalChat.register.get(newMessage.channelId))) {
		return;
	}

	const messages: undefined | { channelId: string; messageId: string }[] =
		await newMessage.client.botData.globalChat.messages.get(newMessage.id);
	if (!messages) {
		return;
	}
	for (const value of messages) {
		const channel = newMessage.client.channels.cache.get(value.channelId);
		if (!channel) {
			continue;
		}
		if (channel.type !== ChannelType.GuildText) {
			continue;
		}
		const webhooks = await channel.fetchWebhooks();
		const webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== newMessage.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');
		const attachments: Array<string | AttachmentBuilder> = [];
		if (newMessage.attachments.size > 0) {
			newMessage.attachments.map((attachment) =>
				attachments.push(attachment.spoiler ? new AttachmentBuilder(attachment.url).setSpoiler(true) : attachment.url),
			);
		}
		const stickerEmbeds: EmbedBuilder[] = [];
		if (newMessage.stickers.size > 0) {
			if (newMessage.stickers.first()?.format === StickerFormatType.Lottie) {
				stickerEmbeds.push(
					new EmbedBuilder().setColor(Colors.Blue).setDescription('このスタンプに対応していないため、表示できません。'),
				);
			} else {
				stickerEmbeds.push(
					new EmbedBuilder().setTitle('スタンプ').setColor(Colors.Blue).setImage(newMessage.stickers.first()!.url),
				);
			}
		}

		const content =
			newMessage.cleanContent.slice(0, 1500) === newMessage.cleanContent
				? newMessage.cleanContent
				: `${newMessage.cleanContent.slice(0, 1500) ?? '内容がありません。'}`;
		if (newMessage.type === MessageType.Reply) {
			const repliedMessage = await newMessage.fetchReference();
			const embed = new EmbedBuilder()
				.setAuthor({
					name:
						repliedMessage.author.discriminator === '0'
							? repliedMessage.author.globalName
								? `${repliedMessage.author.globalName}(@${repliedMessage.author.username})`
								: `@${repliedMessage.author.username}`
							: `${repliedMessage.author.username}#${repliedMessage.author.discriminator}`,
					iconURL: repliedMessage.author.displayAvatarURL({ extension: 'webp' }),
				})
				.setDescription(repliedMessage.content ?? 'メッセージの内容がありません。')
				.setColor(Colors.Blue);
			stickerEmbeds.push(embed);
		}
		webhook?.editMessage(value.messageId, {
			content,
			files: attachments,
			embeds: stickerEmbeds,
		});
	}
}
async function superGlobalChat(newMessage: Message) {
	const user = newMessage.author;

	if (user.bot || user.system || user.discriminator === '0000') {
		return;
	}
	if (newMessage.channel.type !== ChannelType.GuildText) {
		return;
	}
	if (!(await newMessage.client.botData.superGlobalChat.register.get(newMessage.channelId))) {
		return;
	}
	const msgs: undefined | { channelId: string; messageId: string }[] =
		await newMessage.client.botData.superGlobalChat.messages.get(newMessage.id);
	if (!msgs) {
		return;
	}
	for (const value of msgs) {
		const channel = newMessage.client.channels.cache.get(value.channelId);
		if (!channel) {
			continue;
		}
		if (channel.type !== ChannelType.GuildText) {
			continue;
		}
		const webhooks = await channel.fetchWebhooks();
		const webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== newMessage.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		const content =
			newMessage.content.slice(0, 1500) === newMessage.content
				? newMessage.content
				: `${newMessage.content.slice(0, 1500)}...`;
		webhook?.editMessage(value.messageId, {
			content: content,
		});
	}
	const channel = newMessage.client.channels.cache.get(newMessage.client.botData.sgcJsonChannelId);
	if (channel && channel.type === ChannelType.GuildText) {
		if (newMessage.channel.type !== ChannelType.GuildText) {
			return;
		}
		const data: MessageEditData = { type: 'edit', messageId: newMessage.id, content: newMessage.content };
		channel.send(JSON.stringify(data));
	}
}
export default {
	name: Events.MessageUpdate,
	once: false,
	async execute(_oldMessage: Message, newMessage: Message) {
		await dissoku(newMessage);
		await globalChat(newMessage);
		await superGlobalChat(newMessage);
	},
};
