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
		const { messageIndex, register, messages } = interaction.client.botData.newGlobalChat;
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
		const registed = await register.get(interaction.channelId);
		if (!registed)
			return await interaction.error('失敗', 'グローバルチャットのメッセージ以外を通報することはできません', true);
		const mId = await messageIndex.get(interaction.targetId);

		if (mId) {
			interaction.client.channels.fetch(interaction.client.botData.gcChannelId.report).then(async (channel) => {
				if (channel?.isSendable()) {
					const message = await messages.get(mId);
					const button = [];
					if (message) {
						const relayMessage = message.relays.find(
							(d) => d.channelId === interaction.client.botData.gcChannelId.base,
						);

						const base = new ButtonBuilder().setLabel('メッセージに飛ぶ').setStyle(ButtonStyle.Link);
						if (relayMessage) {
							button.push(
								base.setURL(
									`https://discord.com/channels/${relayMessage.guildId}/${relayMessage.channelId}/${relayMessage.id}`,
								),
							);
						} else if (message.channelId === interaction.client.botData.gcChannelId.base) {
							button.push(base.setURL(`https://discord.com/channels/${message.guildId}/${message.channelId}/${mId}`));
						}
					}
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
								...button,
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
