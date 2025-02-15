import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed } from '../../embeds/infosEmbed.js';
import { generateCustomId } from '../../utils/generateCustomId.js';

export default class Slowmode implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('slowmode')
			.setDescription('低速モードを設定します')
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild])
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
		this.settings = {
			enable: true,
			permissions: [PermissionFlagsBits.ManageChannels],
			guildOnly: true,
			channelTypes: [
				ChannelType.AnnouncementThread,
				ChannelType.GuildAnnouncement,
				ChannelType.GuildText,
				ChannelType.PrivateThread,
				ChannelType.PublicThread
			]
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		if (!interaction.channel || interaction.channel.isDMBased()) {
			return await interaction.reply({
				embeds: [failEmbed('このチャンネルの種類には非対応です')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		return await interaction.showModal(
			new ModalBuilder()
				.setTitle('低速モード')
				.setCustomId(generateCustomId('chatinput', 'modal', 'slowmode', 'time'))
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setMaxLength(5)
							.setLabel('低速モードの秒数')
							.setCustomId('second')
							.setRequired(false)
							.setStyle(TextInputStyle.Short)
							.setValue(String(interaction.channel.rateLimitPerUser ?? ''))
					)
				)
		);
	}
}
