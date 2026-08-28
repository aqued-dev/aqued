import {
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	WebhookClient,
} from 'discord.js';
import { MongoDB } from '../../utils/MongoDB.js';
import { translatePermission } from '../../utils/permission.js';
import { userFormat } from '../../utils/userFormat.js';

export interface NewGlobalChatRegisterData {
	webhook: { id: string; token: string };
	guildId: string;
}

export interface NewGlobalChatMessageRelayData {
	guildId: string;
	channelId: string;
	id: string;
}

export interface NewGlobalChatMessageData extends Omit<NewGlobalChatMessageRelayData, 'id'> {
	relays: NewGlobalChatMessageRelayData[];
}

const permissions = PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageWebhooks;

export default {
	command: new SlashCommandBuilder()
		.setName('globalchat')
		.setDescription('グローバルチャットに参加/退出します。')
		.addChannelOption((input) =>
			input.addChannelTypes(ChannelType.GuildText).setName('channel').setDescription('チャンネル').setRequired(false),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild])
		.setDefaultMemberPermissions(permissions),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: false });
		const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]) || interaction.channel;

		if (!interaction.guild || channel?.type !== ChannelType.GuildText) {
			return await interaction.error('参加失敗', 'テキストチャンネル以外ではグローバルチャットに参加できません', true);
		}

		const member =
			interaction.guild.members.cache.get(interaction.user.id) ??
			(await interaction.guild.members.fetch(interaction.user.id));

		const bot = interaction.guild.members.me || (await interaction.guild.members.fetchMe());
		if (!member) {
			return await interaction.error('参加失敗', 'メンバー情報を取得できませんでした', true);
		}

		const authorPerms = channel.permissionsFor(member);

		if (!authorPerms || !authorPerms.has(permissions)) {
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、Botに`' + translatePermission(permissions).join(', ') + '`の権限が必要です',
				true,
			);
		}

		const botPerms = channel.permissionsFor(bot);
		if (!botPerms || !botPerms.has(permissions)) {
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、Botに`' + translatePermission(permissions).join(', ') + '`の権限が必要です',
				true,
			);
		}
		const { register } = interaction.client.botData.newGlobalChat;

		const data = await register.get(channel.id);
		const executer = userFormat(member);
		const avatar = interaction.client.user.displayAvatarURL({ extension: 'webp' });

		if (data?.webhook?.id && data?.webhook?.token) {
			const webhook = new WebhookClient({ id: data.webhook.id, token: data.webhook.token });
			await webhook.delete(`グローバルチャットから退出したため。実行者: ${executer}`);
			await register.delete(channel.id);

			const embed = new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('グローバルチャットから退出')
				.setDescription(
					`${interaction.guild.name}がグローバルチャットから退出しました。\n現在のグローバルチャット参加数は\`${await register.size()}\`です。`,
				);

			if (interaction.guild.icon) {
				embed.setThumbnail(
					interaction.guild.icon.startsWith('a_')
						? interaction.guild.iconURL({ extension: 'gif' })
						: interaction.guild.iconURL({ extension: 'webp' }),
				);
			}

			await systemSender(register, embed, avatar);
			await interaction.ok('退出', '退出が完了しました', false);
		} else {
			const webhook = await channel.createWebhook({
				name: 'Aqued',
				avatar,
				reason: `グローバルチャットに参加したため。実行者: ${executer}`,
			});

			await register.set(channel.id, {
				webhook: { id: webhook.id, token: webhook.token },
				guildId: interaction.guild.id,
			});

			const embed = new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('グローバルチャットに参加')
				.setDescription(
					`${interaction.guild.name}がグローバルチャットに参加しました。\n現在のグローバルチャット参加数は\`${await register.size()}\`です。`,
				);

			if (interaction.guild.icon) {
				embed.setThumbnail(
					interaction.guild.icon.startsWith('a_')
						? interaction.guild.iconURL({ extension: 'gif' })
						: interaction.guild.iconURL({ extension: 'webp' }),
				);
			}

			await systemSender(register, embed, avatar);

			await interaction.ok('参加', '参加が完了しました', false);
		}
	},
};

export const systemSender = async (register: MongoDB, embed: EmbedBuilder, avatarURL: string) => {
	const registers = await register.values();

	for (const register of registers) {
		const webhook = new WebhookClient({ id: register.webhook.id, token: register.webhook.token });
		await webhook.send({ embeds: [embed], username: 'Aqued System', avatarURL });
	}
};
