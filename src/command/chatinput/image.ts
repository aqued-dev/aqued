import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('image')
		.setDescription('画像を表示する系コマンド。')
		.addSubcommand((input) => input.setName('cat').setDescription('猫の画像を表示します。'))
		.addSubcommand((input) => input.setName('dog').setDescription('犬の画像を表示します。')),

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
							embeds: [new EmbedBuilder().setTitle('🐈｜猫').setImage(data[0].url).setColor(Colors.Blue)],
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
							embeds: [new EmbedBuilder().setTitle('🐶｜犬').setImage(data.message).setColor(Colors.Blue)],
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
