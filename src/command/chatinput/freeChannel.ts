import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	InteractionContextType,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('free_channel')
		.setDescription('誰でもチャンネルを作れるパネルを生成します。')
		.addChannelOption((input) =>
			input
				.addChannelTypes(ChannelType.GuildCategory)
				.setName('channel')
				.setDescription('テキストチャンネルを作成するカテゴリ')
				.setRequired(true),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageChannels],
	async execute(interaction: ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildCategory]);
		await interaction.client.botData.aquedFreeChannel.set(interaction.channelId, channel.id);
		await interaction.showModal(
			new ModalBuilder()
				.setTitle('パネル設定')
				.setCustomId('freeChannelPanel')
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('タイトル')
							.setCustomId('title')
							.setMaxLength(200)
							.setPlaceholder('タイトル')
							.setRequired(false)
							.setStyle(TextInputStyle.Short),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('メッセージ')
							.setCustomId('message')
							.setMaxLength(1000)
							.setPlaceholder('メッセージ')
							.setRequired(false)
							.setStyle(TextInputStyle.Paragraph),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setLabel('1ユーザーのチャンネル数制限(デフォルト:なし)')
							.setCustomId('userchannelnumber')
							.setMaxLength(2)
							.setPlaceholder('1-20')
							.setRequired(false)
							.setStyle(TextInputStyle.Short),
					),
				),
		);
	},
};
