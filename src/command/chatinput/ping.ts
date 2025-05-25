import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
export default {
	command: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('botのping値を返します。')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(':ping_pong:Pong!')
					.setDescription(
						`${
							interaction.client.ws.ping === Number('-1')
								? '起動直後のため返すことができません。'
								: '`' + interaction.client.ws.ping + '`ms'
						}`,
					)
					.setColor(Colors.Blue),
			],
		});
	},
};
