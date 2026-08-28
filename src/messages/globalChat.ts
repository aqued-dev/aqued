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
					.setDescription(truncateContent(repliedMessage.cleanContent) || '(内容がありません)'),
			);

			button = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('返信先メッセージ');
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
const CONCURRENCY = 10;

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

	let repliedMessageRecord: NewGlobalChatMessageData | undefined;
	if (repliedMessageId && button) {
		const indexed = await messageIndex.get(repliedMessageId);
		if (indexed) {
			repliedMessageRecord = (await messages.get(indexed)) ?? undefined;
		}
	}

	let editMessageRecord: NewGlobalChatMessageData | undefined;
	let editIndexed: string | undefined;
	if (edit) {
		editIndexed = await messageIndex.get(id);
		if (editIndexed) {
			editMessageRecord = (await messages.get(editIndexed)) ?? undefined;
		}
	}

	const targets = registers.filter((r) => r.key !== channel.id);

	const sendToTarget = async (registedData: (typeof targets)[number]) => {
		const key = registedData.key;
		const value = registedData.value as NewGlobalChatRegisterData;

		try {
			const webhook = new WebhookClient({ id: value.webhook.id, token: value.webhook.token });

			const targetData: WebhookMessageCreateOptions = { ...data };

			if (repliedMessageId && button) {
				const targetButton = ButtonBuilder.from(button).setURL('https://example.com/').setDisabled(true);

				if (repliedMessageRecord) {
					const relayMessage = repliedMessageRecord.relays.find((d) => d.channelId === key) || {
						guildId: repliedMessageRecord.guildId,
						channelId: repliedMessageRecord.channelId,
						id: repliedMessageId,
					};
					targetButton
						.setURL(`https://discord.com/channels/${relayMessage.guildId}/${relayMessage.channelId}/${relayMessage.id}`)
						.setDisabled(false);
				}
				targetData.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(targetButton)];
			}

			if (edit) {
				if (!editIndexed) return;
				const relayMessage = editMessageRecord?.relays?.find((d) => d.channelId === key);
				if (!relayMessage) return;

				await webhook.editMessage(relayMessage.id, targetData as WebhookMessageEditOptions);
				return;
			} else {
				const message = await webhook.send(targetData);
				await messageIndex.set(message.id, id);
				relays.push({ guildId: value.guildId, channelId: message.channel_id, id: message.id });
				return;
			}
		} catch (error) {
			console.log(error);
			if (error instanceof DiscordAPIError) {
				if (error.code === 10015 || error.code === 50027) {
					const targetChannel = client.channels.cache.get(key) || (await client.channels.fetch(key));

					if (targetChannel?.type === ChannelType.GuildText) {
						let reason = '削除されていたため再生成しました';

						if (error.code === 50027) {
							reason = '使用不可になっていたため';

							const webhooks = await targetChannel.fetchWebhooks();
							const deletions = webhooks
								.filter(
									(webhook) =>
										webhook.name === 'Aqued' &&
										(webhook.owner?.id === client.user.id || webhook.applicationId === client.user.id),
								)
								.map((webhook) => webhook.delete(reason));
							await Promise.allSettled(deletions);
						}

						const avatar = client.user.displayAvatarURL({ extension: 'webp' });
						const newWebhook = await targetChannel.createWebhook({
							name: 'Aqued',
							avatar,
							reason,
						});

						await register.set(key, {
							webhook: { id: newWebhook.id, token: newWebhook.token },
							guildId: guild.id,
						});

						const message = await newWebhook.send(data);
						await messageIndex.set(message.id, id);
						relays.push({ guildId: message.guildId, channelId: message.channelId, id: message.id });
						return;
					}
				} else if (error.code === 10003) {
					await register.delete(key);
					return;
				}
			}
		}
	};

	for (let i = 0; i < targets.length; i += CONCURRENCY) {
		const chunk = targets.slice(i, i + CONCURRENCY);
		await Promise.allSettled(chunk.map(sendToTarget));
	}

	await messages.set(id, { guildId: guild.id, channelId: channel.id, relays });
};
