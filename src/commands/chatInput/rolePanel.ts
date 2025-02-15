import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionContextType,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SnowflakeUtil,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed } from '../../embeds/infosEmbed.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class RolePanel implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		const command = new SlashCommandBuilder()
			.setName('rolepanel')
			.setDescription('ロールパネルを設置します')
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild])
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);
		for (const index of [...Array(10).keys()]) {
			command.addRoleOption((input) =>
				input
					.setName(`role_${index + 1}`)
					.setDescription(`パネルに追加するロール${index + 1}つ目`)
					.setRequired(index === 0)
			);
		}
		this.command = command;
		this.settings = { enable: true, permissions: [PermissionFlagsBits.ManageRoles], guildOnly: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) {
			return;
		}
		const member = await interaction.guild.members.fetch(interaction.user.id);

		const failEmbeds: EmbedBuilder[] = [];
		const roles: { name: string; id: string }[] = [];
		for (let index = 0; index < 10; index++) {
			const rawRole = interaction.options.getRole(`role_${index}`);
			if (!rawRole) {
				continue;
			}
			const role = await interaction.guild.roles.fetch(rawRole.id, { cache: true });
			if (interaction.guild.ownerId !== member.user.id) {
				if (member.roles.highest.position <= (role?.position ?? 0)) {
					failEmbeds.push(failEmbed(`${role?.name ?? '不明なロール'} はあなたが持っているロールよりも上です`));
				}
			}
		}
		if (failEmbeds.length) {
			return await interaction.reply({ embeds: failEmbeds, flags: [MessageFlags.Ephemeral] });
		}
		const panelId = SnowflakeUtil.generate().toString();
		interaction.client.aqued.rolePanelCache.set(panelId, roles);
		return await interaction.showModal(
			new ModalBuilder()
				.setTitle('パネル設定')
				.setCustomId(generateCustomId('chatinput', 'modal', 'rolepanel', 'create', 'panelid', panelId))
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('title')
							.setLabel('タイトル')
							.setMaxLength(100)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder('デフォルト：ロールパネル')
							.setRequired(false)
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('description')
							.setLabel('メッセージ')
							.setMaxLength(100)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder('デフォルト：以下のメニューで、ロールを付け外しできます')
							.setRequired(false)
					)
				)
		);
	}
}
