import {
	ActionRowBuilder,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	InteractionContextType,
	MessageContextMenuCommandInteraction,
	MessageFlags,
} from 'discord.js';
import { userFormat } from '../../utils/userFormat.js';
export default {
	command: new ContextMenuCommandBuilder()
		.setName('通報(グローバルチャット)')
		.setType(ApplicationCommandType.Message)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild]),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: MessageContextMenuCommandInteraction) {
		const { messageIndex, register } = interaction.client.botData.newGlobalChat;
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
		const registed = await register.get(interaction.channelId);
		if (!registed)
			return await interaction.error('失敗', 'グローバルチャットのメッセージ以外を通報することはできません', true);
		const mId = await messageIndex.get(interaction.targetId);

		if (mId) {
			interaction.client.channels.fetch(interaction.client.botData.errorChannelId).then(async (channel) => {
				if (channel?.isSendable()) {
					channel.send({
						content: interaction.client.botData.mods.map((v) => `<@${v}>`).join(', '),
						embeds: [
							new EmbedBuilder()
								.setColor(Colors.Red)
								.setTitle('通報')
								.setDescription(`MID: ${mId}\n報告者: ${userFormat(interaction.user)}`),
						],
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setLabel('何もしない')
									.setStyle(ButtonStyle.Primary)
									.setCustomId(`newGlobalChatMessages_abandoned`),
								new ButtonBuilder()
									.setLabel('削除')
									.setStyle(ButtonStyle.Danger)
									.setCustomId(`newGlobalChatMessages_delete_${mId}`),
							),
						],
						allowedMentions: { users: interaction.client.botData.mods },
					});
				}
			});
			return await interaction.ok('完了', `ご報告ありがとうございます。`, true);
		} else {
			return await interaction.error('失敗', 'グローバルチャットのメッセージ以外を通報することはできません', true);
		}
	},
};
