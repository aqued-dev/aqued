/* eslint-disable unicorn/no-nested-ternary */
import {
	ChannelType,
	Colors,
	EmbedBuilder,
	Message,
	SnowflakeUtil,
	Webhook,
	calculateUserDefaultAvatarIndex,
} from 'discord.js';
import { MessageData } from '../utils/SuperGlobalChatType.js';
import { inspect } from 'node:util';

export default async function (message: Message) {
	try {
		const channelDB = message.client.botData.superGlobalChat.register;
		if (!(await channelDB.get(message.channelId))) return;
		if (message.author.bot || message.author.system || message.author.discriminator === '0000') return;
		if (message.channel.type !== ChannelType.GuildText) return;
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
		const channels = await channelDB.keys();
		if (!channels) return;
		const data: MessageData = {
			type: 'message',
			version: '2.1.7',
			userId: message.author.id,
			userName: message.author.username,
			userDiscriminator: message.author.discriminator,
			userAvatar: message.author.avatar,
			isBot: message.author.bot,
			guildId: message.guild.id,
			guildName: message.guild.name,
			guildIcon: message.guild.icon,
			channelId: message.channel.id,
			channelName: message.channel.name,
			messageId: message.id,
			content: message.content,
		};

		if (message.attachments.size > 0) data['attachmentsUrl'] = message.attachments.map((value) => value.proxyURL);
		const content =
			message.content.slice(0, 1500) === message.content ? message.content : `${message.content.slice(0, 1500)}...`;
		const embeds: EmbedBuilder[] = [];
		if (message.reference) {
			const repliedMessage:
				| {
						content: string;
						id: string;
						user: { discriminator: string; globalName: string; username: string; extDefaultAvatarURL: string };
				  }
				| undefined = await message.client.botData.superGlobalChat.replyMessages.get(message.reference.messageId);
			if (!repliedMessage) return;
			data['reference'] = repliedMessage.id;
			const embed = new EmbedBuilder()
				.setAuthor({
					name:
						repliedMessage.user.discriminator === '0'
							? repliedMessage.user.globalName
								? `${repliedMessage.user.globalName}(@${repliedMessage.user.username})`
								: `@${repliedMessage.user.username}`
							: `${repliedMessage.user.username}#${repliedMessage.user.discriminator}`,
					iconURL: repliedMessage.user.extDefaultAvatarURL,
				})
				.setDescription(repliedMessage.content ?? 'メッセージの内容がありません。')
				.setColor(Colors.Blue);
			embeds.push(embed);
		}

		for (const channel of channels) {
			const Sendchannel = message.client.channels.cache.get(channel);
			if (!Sendchannel) continue;
			if (Sendchannel.type !== ChannelType.GuildText) continue;
			if (message.channelId === Sendchannel.id) continue;
			const webhooks = await Sendchannel.fetchWebhooks();
			const webhook: Webhook =
				!webhooks.some((value) => value.name === 'Aqued') ||
				webhooks.find((value) => value.name === 'Aqued').owner.id !== message.client.user.id
					? await Sendchannel.createWebhook({ name: 'Aqued' })
					: webhooks.find((value) => value.name === 'Aqued');
			await webhook
				.send({
					content,
					files: data.attachmentsUrl || [],
					avatarURL: message.author.avatar
						? message.client.rest.cdn.avatar(message.author.id, message.author.avatar, { extension: 'webp' })
						: message.client.rest.cdn.defaultAvatar(
								message.author.discriminator === '0'
									? calculateUserDefaultAvatarIndex(message.author.id)
									: Number(message.author.discriminator) % 5,
						  ),
					embeds,
					username: `${message.author.username}${
						message.author.discriminator === '0' ? '' : `#${message.author.discriminator}`
					}(id: ${message.author.id})`,
				})
				.then(async (value) => {
					const array: { channelId: string; messageId: string }[] =
						(await message.client.botData.superGlobalChat.messages.get(message.id)) || [];
					array.push({
						channelId: value.channelId,
						messageId: value.id,
					});
					await message.client.botData.superGlobalChat.messages.set(message.id, array);
					if (message.reference) {
						const repliedMessage:
							| {
									content: string;
									id: string;
									user: { discriminator: string; globalName: string; username: string; extDefaultAvatarURL: string };
							  }
							| undefined = await message.client.botData.superGlobalChat.replyMessages.get(message.reference.messageId);
						if (!repliedMessage) return;
						await message.client.botData.superGlobalChat.replyMessages.set(value.id, {
							content: message.content,
							id: message.id,
							user: {
								discriminator: message.author.discriminator,
								globalName: message.author.globalName,
								username: message.author.username,
								extDefaultAvatarURL: message.author.extDefaultAvatarURL({ extension: 'webp' }),
							},
						});
					}
				});
		}
		await message.client.botData.superGlobalChat.replyMessages.set(message.id, {
			content: message.content,
			id: message.id,
			user: {
				discriminator: message.author.discriminator,
				globalName: message.author.globalName,
				username: message.author.username,
				extDefaultAvatarURL: message.author.extDefaultAvatarURL({ extension: 'webp' }),
			},
		});
		message.react('✅');
		const channel = message.client.channels.cache.get(message.client.botData.sgcJsonChannelId);
		if (channel && channel.isTextBased()) {
			if (message.channel.type !== ChannelType.GuildText) return;
			channel.send(JSON.stringify(data));
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
	}
}
