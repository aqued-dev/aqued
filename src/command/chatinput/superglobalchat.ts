import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { translatePermission } from '../../utils/permission.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';

export default {
	command: new SlashCommandBuilder()
		.setName('superglobalchat')
		.setDescription('スーパーグローバルチャットに参加/退出します。')
		.setGuildOnly()
		.addChannelOption((input) =>
			input.addChannelTypes(ChannelType.GuildText).setName('channel').setDescription('チャンネル').setRequired(true),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: true,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		const permissions = [PermissionFlagsBits.ManageChannels];
		const authorPerms = interaction.channel.permissionsFor(interaction.guild.members.cache.get(interaction.user.id));
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
		const botPerms = interaction.channel.permissionsFor(
			interaction.guild.members.cache.get(interaction.client.user.id),
		);
		if (!botPerms || !permissions.every((permission) => botPerms.has(permission))) {
			const permission: bigint[] = permissions;
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、Botに`' + translatePermission(permission).join(', ') + '`の権限が必要です。',
				true,
			);
		}
		const { register } = interaction.client.botData.superGlobalChat;
		const optionsChannel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

		if (await register.get(optionsChannel.id)) {
			await register.delete(optionsChannel.id);
			await interaction.ok('退出しました。', '退出が完了しました。', false);
		} else {
			await register.set(optionsChannel.id, true);
			await interaction.ok('参加しました。', '参加が完了しました。', false);
		}
	},
};
