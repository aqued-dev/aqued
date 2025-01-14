import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ContextMenuCommandBuilder,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	MessageFlags
} from 'discord.js';
import { type CommandSetting } from '../../../core/types/CommandSetting.js';
import type { MessageContextMenuCommand } from '../../../core/types/ContextCommand.js';
import { failEmbed, infoEmbed } from '../../../embeds/infosEmbed.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';
import Tanzaku from '../../chatInput/tanzaku.js';

export default class TanzakuContext implements MessageContextMenuCommand {
	public command: ContextMenuCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new ContextMenuCommandBuilder()
			.setName('短冊')
			.setType(3)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);

		this.settings = {
			enable: true
		};
	}

	async run(interaction: MessageContextMenuCommandInteraction) {
		const text = interaction.targetMessage.cleanContent;
		if (!text) {
			await interaction.reply({
				embeds: [failEmbed('指定したメッセージに内容がありません')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		const base = new Tanzaku();
		const button = new ButtonBuilder()
			.setLabel('短冊を削除する')
			.setEmoji('🗑️')
			.setStyle(ButtonStyle.Danger)
			.setCustomId(generateCustomId('chatinput', 'button', 'tanzaku', 'delete', 'user_id', interaction.user.id));
		await interaction.reply({
			embeds: [infoEmbed(base.generate(text), '🎋｜短冊')],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
		});
	}
}
