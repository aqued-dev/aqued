import {
	ApplicationCommandType,
	ChannelType,
	MessageContextMenuCommandInteraction,
	PermissionFlagsBits,
} from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';

export default {
	command: new ContextMenuCommandBuilder()
		.setName('Force Pin解除')
		.setType(ApplicationCommandType.Message)
		.setGuildOnly(),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageWebhooks],

	async execute(interaction: MessageContextMenuCommandInteraction) {
		const { botData } = interaction.client;
		const { forcePin } = botData;
		if (interaction.targetMessage.channel.type !== ChannelType.GuildText)
			return await interaction.error('Force Pinを解除できませんでした。', 'テキストチャンネルでお試しください。', true);
		if (!(await forcePin.get(interaction.targetMessage.channelId)))
			return await interaction.error('Force Pinを解除できませんでした。', 'Force Pinが設定されていません。', true);
		await forcePin.delete(interaction.targetMessage.channelId);
		await interaction.ok(
			'Force Pinを解除しました。',
			'Force Pinの設定は、`アプリ > Force Pin`で、いつでもできます。',
			false,
		);
	},
};
