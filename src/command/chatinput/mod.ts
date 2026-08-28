import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	LabelBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	WebhookClient,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('botモデレーター専用コマンド')
		.addSubcommand((input) =>
			input
				.setName('iconsync')
				.setDescription('(botモデレーター専用コマンド)グローバルチャットのwebhookのアイコンを同期します'),
		)
		.addSubcommand((input) =>
			input
				.setName('globalchataquedsystem')
				.setDescription('(botモデレーター専用コマンド)Aqued System Messageを送信します。'),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: true,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'globalchataquedsystem': {
				const modal = new ModalBuilder()
					.setTitle('Aqued System Message')
					.setCustomId('mod_globalchataquedsystem_modal');
				const input = new TextInputBuilder()
					.setCustomId('content')
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder('内容を入力...');
				const label = new LabelBuilder()
					.setLabel('内容')
					.setDescription('Aqued System Messageの内容を入力してください。')
					.setTextInputComponent(input);

				modal.addLabelComponents(label);

				await interaction.showModal(modal);
				break;
			}
			case 'iconsync': {
				await interaction.deferReply({ ephemeral: true });
				const { register } = interaction.client.botData.newGlobalChat;

				const registers = await register.values();

				for (const { webhook } of registers) {
					const { id, token } = webhook;
					const webhookClient = new WebhookClient({ id, token });

					await webhookClient.edit({ avatar: interaction.client.user.displayAvatarURL({ extension: 'webp' }) });
				}

				await interaction.ok('変更しました', '変更しました', true);
				break;
			}
		}
	},
};
