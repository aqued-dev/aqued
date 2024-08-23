import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationIntegrationType, InteractionContextType } from '../../utils/extrans.js';
export default {
	command: new SlashCommandBuilder()
		.setName('message_expander')
		.setDescription('メッセージリンク展開を有効/無効にします。')
		.setGuildOnly()
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],

	async execute(interaction: ChatInputCommandInteraction) {
		const messageExpansion = interaction.client.botData.messageExpansion;

		if (await messageExpansion.get(interaction.guildId)) {
			await messageExpansion.delete(interaction.guildId);
			await interaction.ok('無効にしました。', '無効化が完了しました。', false);
		} else {
			await messageExpansion.set(interaction.guildId, true);
			await interaction.ok('有効にしました。', '有効化が完了しました。', false);
		}
	},
};
