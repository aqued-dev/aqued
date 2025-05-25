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
		.setName('janken')
		.setDescription('じゃんけんをします！')
		.addStringOption((option) =>
			option
				.setName('hand')
				.setDescription('出す手を選んでください')
				.setRequired(true)
				.addChoices(
					{ name: 'グー', value: 'rock' },
					{ name: 'チョキ', value: 'scissors' },
					{ name: 'パー', value: 'paper' },
				),
		)
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),

	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		const userHand = interaction.options.getString('hand', true);
		const hands = ['rock', 'scissors', 'paper'];
		const botHand = hands[Math.floor(Math.random() * hands.length)];
		const result = getResult(userHand, botHand);

		const handEmojis = {
			rock: '✊',
			scissors: '✌️',
			paper: '✋',
		};

		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('🃏 じゃんけん！')
					.setDescription(
						`あなた: ${handEmojis[userHand]}\n` + `Bot: ${handEmojis[botHand]}\n\n` + `**結果: ${result}**`,
					)
					.setColor(Colors.Blue),
			],
		});
	},
};

function getResult(user, bot) {
	if (user === bot) return '引き分け！';
	if (
		(user === 'rock' && bot === 'scissors') ||
		(user === 'scissors' && bot === 'paper') ||
		(user === 'paper' && bot === 'rock')
	) {
		return 'あなたの勝ち！🎉';
	}
	return 'あなたの負け…😢';
}
