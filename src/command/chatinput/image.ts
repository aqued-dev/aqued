import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';
interface DogCEO {
	status: string;
	message: string;
}
interface TheCat {
	id: string;
	url: string;
	width: number;
	height: number;
}
export default {
	command: new SlashCommandBuilder()
		.setName('image')
		.setDescription('画像を表示する系コマンド。')
		.addSubcommand((input) => input.setName('cat').setDescription('猫の画像を表示します。'))
		.addSubcommand((input) => input.setName('dog').setDescription('犬の画像を表示します。'))
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'cat': {
				const response = await fetch('https://api.thecatapi.com/v1/images/search');
				const data = await response.json();

				await (response.ok
					? interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('🐈｜猫')
									.setImage((data as TheCat[])[0]!.url)
									.setColor(Colors.Blue),
							],
						})
					: interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('🐈｜猫')
									.setDescription('画像を取得できませんでした。')
									.setColor(Colors.Blue),
							],
						}));

				break;
			}
			case 'dog': {
				const response = await fetch('https://dog.ceo/api/breeds/image/random');
				const data = await response.json();
				await (response.ok
					? interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('🐶｜犬')
									.setImage((data as DogCEO).message)
									.setColor(Colors.Blue),
							],
						})
					: interaction.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('🐶｜犬')
									.setDescription('画像を取得できませんでした。')
									.setColor(Colors.Blue),
							],
						}));
				break;
			}
			default: {
				break;
			}
		}
	},
};
