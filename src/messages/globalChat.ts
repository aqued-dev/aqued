/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable unicorn/no-nested-ternary */
import {
	AttachmentBuilder,
	ChannelType,
	Colors,
	EmbedBuilder,
	Message,
	MessageType,
	StickerFormatType,
	Webhook,
} from 'discord.js';

export default async function (message: Message) {
	try {
		const user = message.author;
		if (user.bot || user.system || user.discriminator === '0000') return;
		if (message.channel.type !== ChannelType.GuildText) return;
		if (!(await message.client.botData.globalChat.register.get(message.channelId))) return;
		if (await message.client.botData.globalChat.blocks.get(user.id)) {
			message.react('❌');
			return;
		}
		const LowerCaseContent = message.cleanContent.toLowerCase();

		const discordRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|com|net)|discordapp\.(com|net)\/invite)\/[\dA-Za-z]+/g;
		const disboardRegex = /disboard\.org/g;
		const discopartyRegex = /discoparty\.jp/g;
		const dissokuRegex = /dissoku\.net/g;

		if (
			discordRegex.test(LowerCaseContent) ||
			disboardRegex.test(LowerCaseContent) ||
			discopartyRegex.test(LowerCaseContent) ||
			dissokuRegex.test(LowerCaseContent)
		)
			return message.react('❌');
		const registers = await message.client.botData.globalChat.register.keys();
		for (const value of registers) {
			const channel = message.client.channels.cache.get(value);
			if (!channel) continue;
			if (channel.id === message.channelId) continue;
			if (channel.type !== ChannelType.GuildText) continue;
			const webhooks = await channel.fetchWebhooks();
			const webhook: Webhook =
				!webhooks.some((value) => value.name === 'Aqued') ||
				webhooks.find((value) => value.name === 'Aqued').owner.id !== message.client.user.id
					? await channel.createWebhook({ name: 'Aqued' })
					: webhooks.find((value) => value.name === 'Aqued');
			const attachments: (string | AttachmentBuilder)[] = [];
			if (message.attachments.size > 0) {
				message.attachments.map((attachment) =>
					attachments.push(
						attachment.spoiler ? new AttachmentBuilder(attachment.url).setSpoiler(true) : attachment.url,
					),
				);
			}
			const stickerEmbeds: EmbedBuilder[] = [];
			if (message.stickers.size > 0) {
				if (message.stickers.first().format === StickerFormatType.Lottie)
					stickerEmbeds.push(
						new EmbedBuilder()
							.setColor(Colors.Blue)
							.setDescription('このスタンプに対応していないため、表示できません。'),
					);
				else
					stickerEmbeds.push(
						new EmbedBuilder().setTitle('スタンプ').setColor(Colors.Blue).setImage(message.stickers.first().url),
					);
			}
			const messages: undefined | { channelId: string; messageId: string }[] =
				await message.client.botData.globalChat.messages.get(message.id);
			const content =
				message.cleanContent.slice(0, 1500) === message.cleanContent
					? message.cleanContent
					: `${message.cleanContent.slice(0, 1500)}...` || '内容がありません。';
			if (message.type === MessageType.Reply) {
				const repliedMessage = await message.fetchReference();
				const embed = new EmbedBuilder()
					.setAuthor({
						name:
							repliedMessage.author.discriminator === '0'
								? repliedMessage.author.globalName
									? `${repliedMessage.author.globalName}(@${repliedMessage.author.username})`
									: `@${repliedMessage.author.username}`
								: `${repliedMessage.author.username}#${repliedMessage.author.discriminator}`,
						iconURL: repliedMessage.author.extDefaultAvatarURL({ extension: 'webp' }),
					})
					.setDescription(repliedMessage.content ?? 'メッセージの内容がありません。')
					.setColor(Colors.Blue);
				stickerEmbeds.push(embed);
			}
			if (user.avatar) {
				const avatar = user.avatar.startsWith('a_')
					? user.extDefaultAvatarURL({ extension: 'gif' })
					: user.extDefaultAvatarURL({ extension: 'webp' });
				await webhook
					.send({
						content,
						files: attachments,
						embeds: stickerEmbeds,
						avatarURL: avatar,
						username:
							user.discriminator === '0'
								? user.globalName
									? `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
											message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
									  }${user.globalName}(@${user.username}) userId: ${user.id} mId: ${message.id}`
									: `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
											message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
									  }@${user.username} userId: ${user.id} mId: ${message.id}`
								: user.globalName
								? `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
										message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
								  }${user.globalName}(${user.username}#${user.discriminator}) userId: ${user.id} channelId: ${
										message.channelId
								  } mId: ${message.id}`
								: `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
										message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
								  }${user.username}#${user.discriminator} userId: ${user.id} mId: ${message.id}`,
					})
					.then(async (value) => {
						if (messages) {
							messages.push({ channelId: value.channelId, messageId: value.id });
							await message.client.botData.globalChat.messages.set(message.id, messages);
						} else {
							const newMessages = [];
							newMessages.push({ channelId: value.channelId, messageId: value.id });
							await message.client.botData.globalChat.messages.set(message.id, newMessages);
						}
					});
			} else {
				const avatar = user.extDefaultAvatarURL({ extension: 'webp' });
				await webhook
					.send({
						content,
						files: attachments,
						embeds: stickerEmbeds,
						avatarURL: avatar,
						username:
							user.discriminator === '0'
								? user.globalName
									? `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
											message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
									  }${user.globalName}(@${user.username}) userId: ${user.id} mId: ${message.id}`
									: `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
											message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
									  }@${user.username} userId: ${user.id} mId: ${message.id}`
								: user.globalName
								? `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
										message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
								  }${user.globalName}(${user.username}#${user.discriminator}) userId: ${user.id} channelId: ${
										message.channelId
								  } mId: ${message.id}`
								: `${message.client.botData.owners.includes(user.id) ? '👑 | ' : ''}${
										message.client.botData.mods.includes(user.id) ? '🛠️ | ' : ''
								  }${user.username}#${user.discriminator} userId: ${user.id} mId: ${message.id}`,
					})
					.then(async (value) => {
						if (messages) {
							messages.push({ channelId: value.channelId, messageId: value.id });
							await message.client.botData.globalChat.messages.set(message.id, messages);
						} else {
							const newMessages = [];
							newMessages.push({ channelId: value.channelId, messageId: value.id });
							await message.client.botData.globalChat.messages.set(message.id, newMessages);
						}
					});
			}
		}
		message.react('✅');
	} catch {
		message.react('❌');
	}
}
