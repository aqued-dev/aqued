// eslint-disable-next-line unicorn/prevent-abbreviations
import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('botモデレーター専用コマンド')
		.addSubcommand((input) =>
			input
				.setName('globalmessagedelete')
				.setDescription('(botモデレーター専用コマンド)グローバルチャットのメッセージを削除します。')
				.addStringOption((input) => input.setName('mid').setDescription('メッセージのid').setRequired(true)),
		),
	ownersOnly: false,
	modOnly: true,
	guildOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'globalmessagedelete': {
				const messages: undefined | { channelId: string; messageId: string }[] =
					await interaction.client.botData.globalChat.messages.get(interaction.options.getString('mid'));
				if (!messages) await interaction.error('削除できません', 'メッセージが見つかりません。', true);
				for (const value of messages) {
					const channel = interaction.client.channels.cache.get(value.channelId);
					if (!channel) continue;
					if (channel.type !== ChannelType.GuildText) continue;
					channel.messages.fetch(value.messageId).then((message) => message.delete());
				}
				await interaction.ok('削除しました。', 'メッセージを削除しました。', true);
				break;
			}
		}
	},
};
