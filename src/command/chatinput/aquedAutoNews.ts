import {
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	ChannelType,
	ApplicationIntegrationType,
	InteractionContextType,
	SlashCommandBuilder,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('auto_news')
		.setDescription('ニュースチャンネルの内容を自動的に公開するようにします。')
		.addChannelOption((input) =>
			input
				.addChannelTypes(ChannelType.GuildAnnouncement)
				.setName('channel')
				.setDescription('チャンネル')
				.setRequired(true),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels],
	async execute(interaction: ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildAnnouncement]);
		if (await interaction.client.botData.aquedAutoNews.get(channel.id)) {
			await interaction.client.botData.aquedAutoNews.delete(channel.id);
			await interaction.ok('解除しました。', '再設定はこのコマンドを再実行で可能です。', false);
		} else {
			await interaction.client.botData.aquedAutoNews.set(channel.id, true);
			await interaction.ok('設定しました。', '解除はこのコマンドを再実行でできます。', false);
		}
	},
};
