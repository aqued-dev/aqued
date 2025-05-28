import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
import { choiceArray } from '../../utils/array.js';
export default {
	command: new SlashCommandBuilder()
		.setName('omikuji')
		.setDescription('おみくじができます')
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		const array = ['大吉', '吉', '中吉', '小吉', '半吉', '末吉', '末小吉', '平', '凶', '小凶', '半凶', '末凶', '大凶'];

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('おみくじ')
					.setDescription(`${interaction.user.displayName}さんの今の運勢は！？`)
					.addFields({ name: '運勢', value: choiceArray(array) ?? '超大吉' })
					.setColor(Colors.Blue),
			],
		});
	},
};
