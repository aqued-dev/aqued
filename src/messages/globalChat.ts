import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	DiscordAPIError,
	EmbedBuilder,
	Message,
	MessageType,
	StickerFormatType,
	User,
	WebhookClient,
	WebhookMessageCreateOptions,
	WebhookMessageEditOptions,
} from 'discord.js';
import {
	NewGlobalChatMessageData,
	NewGlobalChatMessageRelayData,
	NewGlobalChatRegisterData,
} from '../command/chatinput/globalChat.js';
import { MongoDB } from '../utils/MongoDB.js';
import { userFormat } from '../utils/userFormat.js';

export const inviteUrls = {
	dissoku: /dissoku\.net/g,
	disboard: /disboard\.org/g,
	discoparty: /discoparty\.jp/g,
	discordApp: /discordapp\.com\/invite\/(?<code>[\w-]*)/gi,
	discord: /discord\.com\/invite\/(?<code>[\w-]*)/gi,
	discordGg: /discord\.gg\/(?<code>[\w-]*)/gi,
	discordCafe: /discordcafe\.app/g,
	dicoall: /dicoall\.com/g,
	sabach: /sabach\.jp/g,
	distopia: /distopia\.top/g,
};

export default async function (message: Message) {
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

		if (inviteDetected) {
			return await message.react('❌');
		}

		const embeds = stickerEmbeds(message.stickers);
		let button: ButtonBuilder | undefined = undefined;
		let repliedMessageId: string | undefined = undefined;

		if (message.type === MessageType.Reply) {
			const repliedMessage = await message.fetchReference();

			// データ移行(Webhookアイコンもこの際に変える。アイコン変えれるコマンドも用意)
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
				username: `${userFormat(message.author)} / ID: ${message.id}`,
				allowedMentions: { parse: [] },
			},
			message,
			button,
			false,
			repliedMessageId,
		);
		message.react('✅');
	} catch (error) {
		console.error(error);
	}
}

export const files = (attachments: Message['attachments']): AttachmentBuilder[] => {
	return attachments.map((attachment) => {
		const builder = new AttachmentBuilder(attachment.url).setName(attachment.name).setSpoiler(attachment.spoiler);

		if (attachment.description) {
			builder.setDescription(attachment.description);
		}
		return builder;
	});
};

export const truncateContent = (content: string, maxLength = 1500): string => {
	if (!content) return '内容がありません。';
	return content.length <= maxLength ? content : `${content.slice(0, maxLength)}...`;
};

export const stickerEmbeds = (stickers: Message['stickers']): EmbedBuilder[] => {
	return stickers.map((sticker) => {
		if (sticker.format === StickerFormatType.Lottie) {
			return new EmbedBuilder()
				.setColor(Colors.Blue)
				.setDescription('このスタンプに対応していないため、表示できません');
		} else {
			return new EmbedBuilder().setTitle(sticker.name).setColor(Colors.Blue).setImage(sticker.url);
		}
	});
};

export const avatarUrl = (user: User): string => {
	if (user.avatar?.startsWith('a_')) {
		return user.displayAvatarURL({ extension: 'gif' });
	} else {
		return user.displayAvatarURL({ extension: 'webp' });
	}
};
export const sender = async (
	register: MongoDB<NewGlobalChatRegisterData>,
	messages: MongoDB<NewGlobalChatMessageData>,
	messageIndex: MongoDB<string>,
	data: WebhookMessageCreateOptions,
	{ client, guild, channel, id }: Message,
	button: ButtonBuilder | undefined,
	edit: boolean = false,
	repliedMessageId?: string,
) => {
	if (!guild) return;
	const registers = await register.list();
	const relays: NewGlobalChatMessageRelayData[] = [];
	await messageIndex.set(id, id);

	for (const registedData of registers) {
		const key = registedData.key;
		const value = registedData.value as NewGlobalChatRegisterData;

		if (key === channel.id) continue;
		try {
			const webhook = new WebhookClient({ id: value.webhook.id, token: value.webhook.token });

			if (repliedMessageId && button) {
				button.setURL('https://example.com/').setDisabled(true);

				const indexed = await messageIndex.get(repliedMessageId);
				if (indexed) {
					const message = await messages.get(indexed);
					if (message) {
						const relayMessage = message.relays.find((d) => d.channelId === key) || {
							guildId: message.guildId,
							channelId: message.channelId,
							id: indexed,
						};
						button
							.setURL(
								`https://discord.com/channels/${relayMessage.guildId}/${relayMessage.channelId}/${relayMessage.id}`,
							)
							.setDisabled(false);
					}
				}
				data.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(button)];
			}
			if (edit) {
				const indexed = await messageIndex.get(id);
				if (indexed) {
					const message = await messages.get(indexed);
					const relayMessage = message?.relays?.find((d) => d.channelId === key);
					if (!relayMessage) continue;

					await webhook.editMessage(relayMessage.id, data as WebhookMessageEditOptions);
				}
			} else {
				const message = await webhook.send(data);
				await messageIndex.set(message.id, id);

				relays.push({ guildId: value.guildId, channelId: message.channel_id, id: message.id });
			}
		} catch (error) {
			console.log(error);
			if (error instanceof DiscordAPIError) {
				if (error.code === 10015 || error.code === 50027) {
					const channel = client.channels.cache.get(key) || (await client.channels.fetch(key));

					if (channel?.type === ChannelType.GuildText) {
						let reason = '削除されていたため再生成しました';

						if (error.code === 50027) {
							reason = '使用不可になっていたため';

							const webhooks = await channel.fetchWebhooks();
							webhooks
								.filter(
									(webhook) =>
										webhook.name === 'Aqued' &&
										(webhook.owner?.id === client.user.id || webhook.applicationId === client.user.id),
								)
								.map((webhook) => webhook.delete(reason));
						}
						const avatar = client.user.displayAvatarURL({ extension: 'webp' });
						const webhook = await channel.createWebhook({
							name: 'Aqued',
							avatar,
							reason,
						});

						await register.set(key, {
							webhook: {
								id: webhook.id,
								token: webhook.token,
								avatar,
							},
							guildId: guild.id,
						});

						const message = await webhook.send(data);
						await messageIndex.set(message.id, id);

						relays.push({ guildId: message.guildId, channelId: message.channelId, id: message.id });

						continue;
					}
				} else if (error.code === 10003) {
					await register.delete(key);
					continue;
				}
			}
		}
	}
	await messages.set(id, { guildId: guild.id, channelId: channel.id, relays });
};
