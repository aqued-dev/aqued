import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js';
export default {
	command: new SlashCommandBuilder()
		.setName('bot_invite')
		.setDescription('指定したbotの招待リンクを生成します。')
		.addUserOption((input) => input.setName('bot').setDescription('bot').setRequired(false))
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,
	async execute(interaction: ChatInputCommandInteraction) {
		const bot = interaction.options.getUser('bot');
		if (!bot)
			return await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${interaction.client.user.tag}を招待する。`)
						.setColor(Colors.Blue)
						.setDescription('下のボタンから招待できます。')
						.setThumbnail(interaction.client.user.extDefaultAvatarURL({ extension: 'webp' })),
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('管理者権限')
							.setURL(
								`https://discord.com/api/oauth2/authorize?client_id=${
									interaction.client.user.id
								}&permissions=${PermissionsBitField.Flags.Administrator.toString()}&scope=bot%20applications.commands`,
							),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('権限選択')
							.setURL(
								`https://discord.com/api/oauth2/authorize?client_id=${
									interaction.client.user.id
								}&permissions=${PermissionsBitField.All.toString()}&scope=bot%20applications.commands`,
							),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel('権限なし')
							.setURL(
								`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=0&scope=bot%20applications.commands`,
							),
					),
				],
			});
		if (!bot.bot) return await interaction.error('指定されたものはbotではありません', 'botを指定してください。', true);
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`${bot.tag}を招待する。`)
					.setColor(Colors.Blue)
					.setDescription('下のボタンから招待できます。')
					.setThumbnail(bot.extDefaultAvatarURL({ extension: 'webp' })),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('管理者権限')
						.setURL(
							`https://discord.com/api/oauth2/authorize?client_id=${
								bot.id
							}&permissions=${PermissionsBitField.Flags.Administrator.toString()}&scope=bot%20applications.commands`,
						),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('権限選択')
						.setURL(
							`https://discord.com/api/oauth2/authorize?client_id=${
								bot.id
							}&permissions=${PermissionsBitField.All.toString()}&scope=bot%20applications.commands`,
						),
					new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel('権限なし')
						.setURL(
							`https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=0&scope=bot%20applications.commands`,
						),
				),
			],
		});
	},
};
