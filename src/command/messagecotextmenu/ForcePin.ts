import {
	APIEmbed,
	ApplicationCommandType,
	ApplicationIntegrationType,
	AttachmentBuilder,
	ChannelType,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	GuildMember,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	PermissionFlagsBits,
	StickerFormatType,
	User,
	Webhook,
} from 'discord.js';
import { ForcePinDataType } from '../../utils/ForcePinDataType.js';

export default {
	command: new ContextMenuCommandBuilder()
		.setName('Force Pin')
		.setType(ApplicationCommandType.Message)

		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],

	async execute(interaction: MessageContextMenuCommandInteraction) {
		const { botData, user, users } = interaction.client;
		const { forcePin } = botData;
		if (interaction.targetMessage.channel.type !== ChannelType.GuildText)
			return await interaction.error('Force Pinを設定できませんでした。', 'テキストチャンネルでお試しください。', true);
		const message = interaction.targetMessage;
		const stickerEmbeds: APIEmbed[] = [];
		if (message.stickers.size > 0) {
			if (message.stickers.first().format === StickerFormatType.Lottie)
				stickerEmbeds.push(
					new EmbedBuilder()
						.setColor(Colors.Blue)
						.setDescription('このスタンプに対応していないため、表示できません。')
						.toJSON(),
				);
			else
				stickerEmbeds.push(
					new EmbedBuilder().setTitle('スタンプ').setColor(Colors.Blue).setImage(message.stickers.first().url).toJSON(),
				);
		}
		const messageEmbed: APIEmbed[] = [];
		if (message.embeds.length > 0) {
			if (stickerEmbeds.length > 0) {
				message.embeds.pop();
				message.embeds.map((v) => messageEmbed.push(v.toJSON()));
			} else {
				message.embeds.map((v) => messageEmbed.push(v.toJSON()));
			}
		}
		const attachments: Array<string | AttachmentBuilder> = [];
		if (message.attachments.size > 0) {
			message.attachments.map((attachment) =>
				attachments.push(attachment.spoiler ? new AttachmentBuilder(attachment.url).setSpoiler(true) : attachment.url),
			);
		}
		const webhooks = await interaction.targetMessage.channel.fetchWebhooks();
		const webhook: Webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued').owner.id !== user.id
				? await interaction.targetMessage.channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		if (await forcePin.get(interaction.targetMessage.channelId))
			return await interaction.error(
				'Force Pinを設定できませんでした。',
				'`アプリ > Force Pin解除`で、Force Pinを解除してからもう一度お試しください。',
				true,
			);

		if (interaction.targetMessage.author.discriminator === '0000') {
			const messageUser: User = interaction.targetMessage.author;
			webhook
				.send({
					avatarURL: messageUser.displayAvatarURL({ extension: 'webp' }),
					username: messageUser.displayName,
					embeds: [...messageEmbed, ...stickerEmbeds],
					content: interaction.targetMessage.cleanContent,
					files: attachments,
				})
				.then(async (message_) => {
					message.delete();
					const data: ForcePinDataType = {
						attachments,
						content: interaction.targetMessage.cleanContent,
						embeds: [...messageEmbed, ...stickerEmbeds],
						userId: interaction.targetMessage.author.id,
						latestMessageId: message_.id,
						latestChannelId: message_.channelId,
					};
					await forcePin.set(interaction.targetMessage.channelId, data);
				});
		} else {
			let messageUser: User | GuildMember = interaction.guild.members.cache.get(interaction.targetMessage.author.id);
			if (!messageUser) messageUser = users.cache.get(interaction.targetMessage.author.id);
			webhook
				.send({
					avatarURL: messageUser.displayAvatarURL({ extension: 'webp' }),
					username: messageUser.displayName,
					embeds: [...messageEmbed, ...stickerEmbeds],
					content: interaction.targetMessage.cleanContent,
					files: attachments,
				})
				.then(async (message_) => {
					message.delete();
					const data: ForcePinDataType = {
						attachments,
						content: interaction.targetMessage.cleanContent,
						embeds: [...messageEmbed, ...stickerEmbeds],
						userId: interaction.targetMessage.author.id,
						latestMessageId: message_.id,
						latestChannelId: message_.channelId,
					};
					await forcePin.set(interaction.targetMessage.channelId, data);
				});
		}
		await interaction.ok(
			'Force Pinを設定しました。',
			'Force Pinの解除は、`アプリ > Force Pin解除`で、いつでもできます。',
			false,
		);
	},
};
