/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	MessageContextMenuCommandInteraction,
	Colors,
} from 'discord.js';
import { TanzakuGenerate } from '../../utils/TanzakuGenerate.js';

export default {
	command: new ContextMenuCommandBuilder().setName('短冊').setType(ApplicationCommandType.Message),
	ownersOnly: false,
	modOnly: false,
	guildOnly: false,

	async execute(interaction: MessageContextMenuCommandInteraction) {
		interaction.targetMessage.cleanContent
			? await interaction.reply({
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
								.setCustomId('tanzaku_delete'),
						),
					],
			  })
			: await interaction.error('内容がありません。', '内容が無いため短冊を生成できません。', true);
	},
};
