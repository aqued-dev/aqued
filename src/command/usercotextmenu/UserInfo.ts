/* eslint-disable unicorn/number-literal-case */
import {
	ApplicationCommandType,
	ChannelType,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	PermissionFlagsBits,
} from 'discord.js';

export default {
	command: new ContextMenuCommandBuilder().setName('Force Pin解除').setType(ApplicationCommandType.User),
	ownersOnly: false,
	modOnly: false,
	guildOnly: true,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],

	async execute(interaction: MessageContextMenuCommandInteraction) {
		const { botData } = interaction.client;
		const { forcePin } = botData;
		if (interaction.targetMessage.channel.type !== ChannelType.GuildText)
			return await interaction.error(
				':x: Force Pinを解除できませんでした。',
				'テキストチャンネルでお試しください。',
				true,
			);
		if (!(await forcePin.get(interaction.targetMessage.channelId)))
			return await interaction.error(':x: Force Pinを解除できませんでした。', 'Force Pinが設定されていません。', true);
		await forcePin.delete(interaction.targetMessage.channelId);
		await interaction.ok(
			':o: Force Pinを解除しました。',
			'Force Pinの設定は、`アプリ > Force Pin`で、いつでもできます。',
			true,
		);
	},
};
