import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
import { TanzakuGenerate } from '../../utils/TanzakuGenerate.js';

export default {
	command: new SlashCommandBuilder()
		.setName('tanzaku')
		.setDescription('短冊を生成します。')
		.addStringOption((input) => input.setName('text').setDescription('短冊の内容').setRequired(true))
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('🎋短冊')
					.setDescription(TanzakuGenerate(interaction.options.getString('text')))
					.setColor(Colors.Blue),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel('短冊を削除する')
						.setEmoji('🗑️')
						.setStyle(ButtonStyle.Danger)
						.setCustomId('tanzaku_delete_' + interaction.user.id),
				),
			],
		});
	},
};
