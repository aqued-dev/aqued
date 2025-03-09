import {
	ActionRowBuilder,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
} from 'discord.js';
import { TanzakuGenerate } from '../../utils/TanzakuGenerate.js';

export default {
	command: new ContextMenuCommandBuilder()
		.setName('短冊')
		.setType(ApplicationCommandType.Message)
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: MessageContextMenuCommandInteraction) {
		if (interaction.targetMessage.cleanContent) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('🎋短冊')
						.setDescription(TanzakuGenerate(interaction.targetMessage.cleanContent))
						.setColor(Colors.Blue),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel('短冊を削除する')
							.setEmoji('🗑️')
							.setStyle(ButtonStyle.Danger)
							.setCustomId('tanzaku_delete' + interaction.user.id),
					),
				],
			});
		} else {
			await interaction.error('内容がありません。', '内容が無いため短冊を生成できません。', true);
		}
	},
};
