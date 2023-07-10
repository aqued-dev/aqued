import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'freeChannelPanel') return;
	const title = interaction.fields.getTextInputValue('title') || '🪧｜チャンネル作成';
	const message =
		interaction.fields.getTextInputValue('message') || '以下のボタンを押すことでチャンネル作成ができます。';
	const userchannelnumber = interaction.fields.getTextInputValue('userchannelnumber') || '0000';
	if (Number.isNaN(userchannelnumber)) {
		return await interaction.error('チャンネル数制限に不正な数値', '数字ではありません。', true);
	} else if ((userchannelnumber !== '0000' && Number(userchannelnumber) < 1) || Number(userchannelnumber) > 20) {
		return await interaction.error('チャンネル数制限に不正な数値', '1-20の数字ではありません。', true);
	}
	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle(title).setDescription(message).setColor(Colors.Blue)],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setLabel('チャンネルを作成')
					.setStyle(ButtonStyle.Primary)
					.setCustomId('freechannelcreatebtn_' + userchannelnumber),
			),
		],
	});
}
