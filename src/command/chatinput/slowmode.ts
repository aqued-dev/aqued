import {
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { translatePermission } from '../../utils/permission.js';

export default {
	command: new SlashCommandBuilder().setName('slowmode').setDescription('低速モードを設定します。').setGuildOnly(),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		const permissions = [PermissionFlagsBits.ManageChannels];
		const author = interaction.guild.members.cache.get(interaction.user.id);
		if (!author) return await interaction.error('このメンバーは存在しません。', 'このメンバーは存在しません。', true);
		const authorPerms = author.permissions;
		if (!authorPerms || !permissions.every((permission) => authorPerms.has(permission))) {
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、あなたに`' +
					translatePermission(permissions).join(', ') +
					'`の権限が必要です。',
				true,
			);
		}
		const botPerms = interaction.channel.permissionsFor(
			interaction.guild.members.cache.get(interaction.client.user.id),
		);
		if (!botPerms || !permissions.every((permission) => botPerms.has(permission))) {
			return await interaction.error(
				'権限不足',
				'このコマンドを実行するためには、Botに`' + translatePermission(permissions).join(', ') + '`の権限が必要です。',
				true,
			);
		}
		await interaction.showModal(
			new ModalBuilder()
				.setTitle('低速モード')
				.setCustomId('slowmode_setting_modal')
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setMaxLength(5)
							.setLabel('低速モードの秒数')
							.setRequired(false)
							.setCustomId('slowmode_sec')
							.setRequired(true)
							.setStyle(TextInputStyle.Short)
							.setValue(interaction.channel.rateLimitPerUser ? String(interaction.channel.rateLimitPerUser) : ''),
					),
				),
		);
	},
};
