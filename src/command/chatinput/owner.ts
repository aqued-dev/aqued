import {
	ActivityType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('owner')
		.setDescription('bot管理者専用コマンド')
		.addSubcommand((input) =>
			input
				.setName('error')
				.setDescription('(bot管理者専用コマンド)エラーを表示します。')
				.addStringOption((input) => input.setName('id').setDescription('エラーid').setRequired(true)),
		)
		.addSubcommand((input) =>
			input
				.setName('version')
				.setDescription('(bot管理者専用コマンド)バージョンを変更します。')
				.addStringOption((input) => input.setName('version').setDescription('バージョン').setRequired(true)),
		)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: true,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'error': {
				await interaction.reply({
					content:
						'```xl\n' +
						((await interaction.client.botData.errors.get(interaction.options.getString('id', true))) ||
							'指定されたidのエラーは存在しません。') +
						'\n```',
					flags: MessageFlags.Ephemeral,
				});
				break;
			}
			case 'version': {
				await interaction.client.botData.infos.set('version', interaction.options.getString('version'));
				interaction.client.user.setPresence({
					status: 'online',
					activities: [
						{
							name:
								'/help | ' +
								interaction.client.guilds.cache.size +
								' Guilds | v' +
								(await interaction.client.botData.infos.get('version')),
							type: ActivityType.Playing,
						},
					],
				});
				await interaction.reply({ content: '変更しました。', flags: MessageFlags.Ephemeral });
				break;
			}
		}
	},
};
