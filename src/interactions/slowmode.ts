import { BaseInteraction } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isModalSubmit() && interaction.customId === 'slowmode_setting_modal') {
		const slowmode = interaction.fields.getTextInputValue('slowmode_sec');
		if (Number.isNaN(Number(slowmode))) {
			return await interaction.error('チャンネルの編集に失敗', '低速モードの値が不正です。', true);
		} else if (Number(slowmode) < 0 || Number(slowmode) > 21_600) {
			return await interaction.error('チャンネルの編集に失敗', '低速モードの値が不正です。', true);
		}
		await interaction.channel.setRateLimitPerUser(Number(slowmode));
		await interaction.ok('低速モードを設定しました。', '低速モードの設定が完了しました。', false);
	}
}
