import {
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';
import { translatePermission } from '../../utils/permission.js';

export default {
	command: new SlashCommandBuilder()
		.setName('globalchat')
		.setDescription('グローバルチャットに参加/退出します。')
		.addChannelOption((input) =>
			input.addChannelTypes(ChannelType.GuildText).setName('channel').setDescription('チャンネル').setRequired(true),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		const permissions = [PermissionFlagsBits.ManageChannels];
		if (!interaction.channel || (interaction.channel && interaction.channel.isDMBased()) || !interaction.guild) {
			return;
		}
		const member = interaction.guild.members.cache.get(interaction.user.id);
		if (!member) {
			return await interaction.error('メンバー不明', 'あなたがサーバー内で見つかりませんでした', true);
		}
		const authorPerms = interaction.channel.permissionsFor(member);
		if (!authorPerms || !permissions.every((permission) => authorPerms.has(permission))) {
			const permission: bigint[] = permissions;
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、あなたに`' +
					translatePermission(permission).join(', ') +
					'`の権限が必要です。',
				true,
			);
		}
		const bot = interaction.guild.members.cache.get(interaction.client.user.id);
		if (!bot) {
			return await interaction.error('メンバー不明', 'Botがサーバー内で見つかりませんでした', true);
		}
		const botPerms = interaction.channel.permissionsFor(bot);
		if (!botPerms || !permissions.every((permission) => botPerms.has(permission))) {
			const permission: bigint[] = permissions;
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、Botに`' + translatePermission(permission).join(', ') + '`の権限が必要です。',
				true,
			);
		}
		const { register, blocks } = interaction.client.botData.globalChat;
		const optionsChannel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

		if (await register.get(optionsChannel.id)) {
			await register.delete(optionsChannel.id);
			await interaction.ok('退出しました。', '退出が完了しました。', false);
			const registers = await register.keys();
			for (const value of registers) {
				const channel = interaction.client.channels.cache.get(value);
				if (!channel) {
					continue;
				}
				if (channel.id === optionsChannel.id) {
					continue;
				}
				if (channel.type !== ChannelType.GuildText) {
					continue;
				}
				const webhooks = await channel.fetchWebhooks();
				const webhook =
					!webhooks.some((value) => value.name === 'Aqued') ||
					webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== interaction.client.user.id
						? await channel.createWebhook({ name: 'Aqued' })
						: webhooks.find((value) => value.name === 'Aqued');
				const embed = new EmbedBuilder()
					.setColor(Colors.Blue)
					.setTitle('グローバルチャットから退出')
					.setDescription(
						`${interaction.guild.name}がグローバルチャットから退出しました。\n現在のグローバルチャット参加数は\`${registers.length}\`です。`,
					);
				if (interaction.guild.icon) {
					embed.setThumbnail(
						interaction.guild.icon.startsWith('a_')
							? interaction.guild.iconURL({ extension: 'gif' })
							: interaction.guild.iconURL({ extension: 'webp' }),
					);
				}
				await webhook?.send({
					embeds: [embed],
					avatarURL: interaction.client.user.displayAvatarURL({ extension: 'webp' }),
					username: 'Aqued System',
				});
			}
		} else {
			if (await blocks.get(interaction.user.id)) {
				return await interaction.error(
					'グローバルチャットに入室できません',
					`あなたはグローバルチャットBanされている為、\n入室、グローバルチャットでの発言ができません。\nban理由: ${await blocks.get(
						interaction.user.id,
					)}\n異論申し立てはサポートサーバーまで。`,
					true,
				);
			}
			await register.set(optionsChannel.id, true);
			await interaction.ok('参加しました。', '参加が完了しました。', false);
			const registers = await register.keys();
			for (const value of registers) {
				const channel = interaction.client.channels.cache.get(value);
				if (!channel) {
					continue;
				}
				if (channel.type !== ChannelType.GuildText) {
					continue;
				}
				const webhooks = await channel.fetchWebhooks();
				const webhook =
					!webhooks.some((value) => value.name === 'Aqued') ||
					webhooks.find((value) => value.name === 'Aqued')?.owner?.id !== interaction.client.user.id
						? await channel.createWebhook({ name: 'Aqued' })
						: webhooks.find((value) => value.name === 'Aqued');
				const embed = new EmbedBuilder()
					.setColor(Colors.Blue)
					.setTitle('グローバルチャットに参加')
					.setDescription(
						`${interaction.guild.name}がグローバルチャットに参加しました。\n現在のグローバルチャット参加数は\`${registers.length}\`です。`,
					);
				if (interaction.guild.icon) {
					embed.setThumbnail(
						interaction.guild.icon.startsWith('a_')
							? interaction.guild.iconURL({ extension: 'gif' })
							: interaction.guild.iconURL({ extension: 'webp' }),
					);
				}

				await webhook?.send({
					embeds: [embed],
					avatarURL: interaction.client.user.displayAvatarURL({ extension: 'webp' }),
					username: 'Aqued System',
				});
			}
		}
		return;
	},
};
