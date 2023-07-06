/* eslint-disable unicorn/no-nested-ternary */
import { EmbedBuilder, Message, Colors, Webhook, AttachmentBuilder, StickerFormatType, APIEmbed } from 'discord.js';

export default async function (message: Message) {
	if (!(await message.client.botData.messageExpansion.get(message.guildId))) return;
	if (message.cleanContent.startsWith('<') && message.cleanContent.endsWith('>')) return;
	const discordMessageRegex = /https?:\/\/(www\.)?(canary|ptb\.)?discord(app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
	const discordMessageMatch = message.cleanContent.match(discordMessageRegex);
	if (!discordMessageMatch) return;
	const urlChannel = message.client.channels.cache.get(discordMessageMatch[5]);
	if (!urlChannel) return;
	if (urlChannel.isDMBased() || !urlChannel.isTextBased()) return;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const urlMessage = await urlChannel.messages.fetch(discordMessageMatch[6]);
	if (message.channel.isDMBased() || !message.channel.isTextBased()) return;
	const webhooks = message.channel.isThread()
		? await message.channel.parent.fetchWebhooks()
		: await message.channel.fetchWebhooks();
	const webhook: Webhook =
		!webhooks.some((value) => value.name === 'Aqued') ||
		webhooks.find((value) => value.name === 'Aqued').owner.id !== urlMessage.client.user.id
			? message.channel.isThread()
				? await message.channel.parent.createWebhook({ name: 'Aqued' })
				: await message.channel.createWebhook({ name: 'Aqued' })
			: webhooks.find((value) => value.name === 'Aqued');
	const stickerEmbeds: APIEmbed[] = [];
	if (urlMessage.stickers.size > 0) {
		if (urlMessage.stickers.first().format === StickerFormatType.Lottie)
			stickerEmbeds.push(
				new EmbedBuilder()
					.setColor(Colors.Blue)
					.setDescription('このスタンプに対応していないため、表示できません。')
					.toJSON(),
			);
		else
			stickerEmbeds.push(
				new EmbedBuilder()
					.setTitle('スタンプ')
					.setColor(Colors.Blue)
					.setImage(urlMessage.stickers.first().url)
					.toJSON(),
			);
	}
	const urlMessageEmbed: APIEmbed[] = [];
	if (urlMessage.embeds.length > 0) {
		if (stickerEmbeds.length > 0) {
			urlMessage.embeds.pop();
			urlMessage.embeds.map((v) => urlMessageEmbed.push(v.toJSON()));
		} else {
			urlMessage.embeds.map((v) => urlMessageEmbed.push(v.toJSON()));
		}
	}
	const attachments: Array<string | AttachmentBuilder> = [];
	if (urlMessage.attachments.size > 0) {
		urlMessage.attachments.map((attachment) =>
			attachments.push(attachment.spoiler ? new AttachmentBuilder(attachment.url).setSpoiler(true) : attachment.url),
		);
	}
	webhook.send({
		avatarURL: urlMessage.author.extDefaultAvatarURL({ extension: 'webp' }),
		username: urlMessage.author.displayName,
		embeds: [...urlMessageEmbed, ...stickerEmbeds],
		content:
			urlMessage.cleanContent === urlMessage.cleanContent.slice(0, 1997)
				? urlMessage.cleanContent
				: `${urlMessage.cleanContent.slice(0, 1997)}...`,
		files: attachments,
	});
}
