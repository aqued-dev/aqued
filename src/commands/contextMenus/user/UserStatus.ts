import {
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	InteractionContextType,
	UserContextMenuCommandInteraction
} from 'discord.js';
import { type CommandSetting } from '../../../core/types/CommandSetting.js';
import type { UserContextMenuCommand } from '../../../core/types/ContextCommand.js';
import { infoEmbed } from '../../../embeds/infosEmbed.js';
import { getPresence } from '../../../utils/getPresence.js';
import { getStatusEmojiText } from '../../../utils/getStatusEmoji.js';
import { userFormat } from '../../../utils/userFormat.js';

export default class ForcePin implements UserContextMenuCommand {
	public command: ContextMenuCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new ContextMenuCommandBuilder()
			.setName('UserStatus')
			.setType(2)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = {
			enable: true
		};
	}

	async run(interaction: UserContextMenuCommandInteraction) {
		const user = interaction.targetUser;
		const presence = getPresence(user);
		return await interaction.reply({
			embeds: [infoEmbed(getStatusEmojiText(presence?.status), `${userFormat(user)}のステータス`)]
		});
	}
}
