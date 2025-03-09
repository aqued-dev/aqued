import { BaseInteraction } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) {
		return;
	}
	if (!interaction.customId.startsWith('verifyModal_')) {
		return;
	}
	const userAnswer = Number(interaction.fields.getTextInputValue('answer'));
	const answer = Number(interaction.customId.replace('verifyModal_', ''));
	const role = await interaction.client.botData.verifyPanel.get(interaction.message.id);
	if (answer === userAnswer) {
		await interaction.guild.members.resolve(interaction.user).roles.add(role);
		await interaction.ok('認証に成功', '認証に成功しました！', true);
	} else {
		await interaction.error('認証に失敗', '答えが違います。', true);
	}
}
