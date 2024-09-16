import { ChatInputCommandInteraction, Colors } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';
import akinator from 'discord.js-akinator';
export default {
	command: new SlashCommandBuilder()
		.setName('akinator')
		.setDescription('アキネーター')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		// 仮。近日中にaki-apiを用いて作成する。
		akinator(interaction, {
			language: 'jp',
			childMode: false,
			useButtons: true,
			embedColor: Colors.Blue,
			translationCaching: {
				enabled: true,
				path: './translationCache',
			},
		});
	},
};
