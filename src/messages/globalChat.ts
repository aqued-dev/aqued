import { ChannelType, Message } from 'discord.js';
import { getWebhook } from '../utils/getWebhook.js';
import { inviteUrlHas } from '../utils/inviteUrl.js';
import { ResultType } from '../utils/Result.js';
import { makeMessageObject } from './messageObject.js';

export default async function (message: Message) {
	const beforeCheck = await before(message);

	if (!beforeCheck) {
		return;
	}

	return await sender(message);
}

async function before({ author, channel, client, channelId, react, cleanContent }: Message) {
	const registed = await client.botData.globalChat.register.get(channelId);
	const blocked = await client.botData.globalChat.blocks.get(author.id);
	const hasInviteUrl = inviteUrlHas(cleanContent.toLowerCase());

	if (!registed) {
		return false;
	}

	if (blocked) {
		await react('❌');
		return false;
	}

	if (hasInviteUrl) {
		await react('❌');
		return false;
	}
	if (author.bot ?? author.system ?? author.discriminator === '0000') {
		return false;
	}

	if (channel.type !== ChannelType.GuildText) {
		return false;
	}

	return true;
}
async function sender({ client, channelId, author, cleanContent, stickers, attachments, react }: Message) {
	const registers = await client.botData.globalChat.register.keys();

	for (const registId of registers) {
		const channel = client.channels.cache.get(registId);

		if (!channel) {
			await client.botData.globalChat.register.delete(registId);
			continue;
		}

		if (channel.id === channelId) {
			continue;
		}

		if (channel.type !== ChannelType.GuildText) {
			continue;
		}

		const webhook = await getWebhook(channel);

		if (webhook.type !== ResultType.Success) {
			continue;
		}
		const messageObject = await makeMessageObject(
			client.rest.cdn,
			author.avatar,
			author,
			cleanContent,
			stickers,
			attachments,
		);

		await webhook.value.send(messageObject);
	}
	return await react('✅');
}
