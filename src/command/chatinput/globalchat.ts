import {
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	Webhook,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('globalchat')
		.setDescription('グローバルチャットに参加/退出します。')
		.setGuildOnly()
		.addChannelOption((input) =>
			input.addChannelTypes(ChannelType.GuildText).setName('channel').setDescription('チャンネル').setRequired(true),
		),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],

	async execute(interaction: ChatInputCommandInteraction) {
		const { register, blocks } = interaction.client.botData.globalChat;
		const optionsChannel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

		if (await register.get(optionsChannel.id)) {
			await register.delete(optionsChannel.id);
			await interaction.ok('退出しました。', '退出が完了しました。', false);
			const registers = await register.keys();
			for (const value of registers) {
				const channel = interaction.client.channels.cache.get(value);
				if (!channel) continue;
				if (channel.id === optionsChannel.id) continue;
				if (channel.type !== ChannelType.GuildText) continue;
				const webhooks = await channel.fetchWebhooks();
				const webhook: Webhook =
					!webhooks.some((value) => value.name === 'Aqued') ||
					webhooks.find((value) => value.name === 'Aqued').owner.id !== interaction.client.user.id
						? await channel.createWebhook({ name: 'Aqued' })
						: webhooks.find((value) => value.name === 'Aqued');
				const embed = new EmbedBuilder()
					.setColor(Colors.Blue)
					.setTitle('グローバルチャットから退出')
					.setDescription(
						`${interaction.guild.name}がグローバルチャットから退出しました。\n現在のグローバルチャット参加数は\`${registers.length}\`です。`,
					);
				if (interaction.guild.icon)
					embed.setThumbnail(
						interaction.guild.icon.startsWith('a_')
							? interaction.guild.iconURL({ extension: 'gif' })
							: interaction.guild.iconURL({ extension: 'webp' }),
					);
				await webhook.send({
					embeds: [embed],
					avatarURL: interaction.client.user.extDefaultAvatarURL({ extension: 'webp' }),
					username: 'Aqued Global System',
				});
			}
		} else {
			if (await blocks.get(interaction.user.id))
				return await interaction.error(
					'グローバルチャットに入室できません',
					`あなたはグローバルチャットBanされている為、\n入室、グローバルチャットでの発言ができません。\nban理由: ${await blocks.get(
						interaction.user.id,
					)}\n異論申し立てはサポートサーバーまで。`,
					true,
				);
			await register.set(optionsChannel.id, true);
			await interaction.ok('参加しました。', '参加が完了しました。', false);
			const registers = await register.keys();
			for (const value of registers) {
				const channel = interaction.client.channels.cache.get(value);
				if (!channel) continue;
				if (channel.type !== ChannelType.GuildText) continue;
				const webhooks = await channel.fetchWebhooks();
				const webhook: Webhook =
					!webhooks.some((value) => value.name === 'Aqued') ||
					webhooks.find((value) => value.name === 'Aqued').owner.id !== interaction.client.user.id
						? await channel.createWebhook({ name: 'Aqued' })
						: webhooks.find((value) => value.name === 'Aqued');
				const embed = new EmbedBuilder()
					.setColor(Colors.Blue)
					.setTitle('グローバルチャットに参加')
					.setDescription(
						`${interaction.guild.name}がグローバルチャットに参加しました。\n現在のグローバルチャット参加数は\`${registers.length}\`です。`,
					);
				if (interaction.guild.icon)
					embed.setThumbnail(
						interaction.guild.icon.startsWith('a_')
							? interaction.guild.iconURL({ extension: 'gif' })
							: interaction.guild.iconURL({ extension: 'webp' }),
					);

				await webhook.send({
					embeds: [embed],
					avatarURL: interaction.client.user.extDefaultAvatarURL({ extension: 'webp' }),
					username: 'Aqued Global System',
				});
			}
		}
	},
};
