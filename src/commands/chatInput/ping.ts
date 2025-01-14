import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';

export default class Ping implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('ping')
			.setDescription('botのping値を返します')
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				infoEmbed(
					interaction.client.ws.ping === Number('-1')
						? '起動直後のため返すことができません'
						: `\`${interaction.client.ws.ping}\`ms`
				)
			]
		});
	}
}
