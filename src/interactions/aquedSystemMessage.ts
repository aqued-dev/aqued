import { BaseInteraction, WebhookClient } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'mod_globalchataquedsystem_modal') return;
	const content = interaction.fields.getTextInputValue('content');
	await interaction.ok('送信開始', '送信が開始しました。', true);
	const registers = await interaction.client.botData.newGlobalChat.register.values();

	for (const register of registers) {
		const webhook = new WebhookClient({ id: register.webhook.id, token: register.webhook.token });
		await webhook.send({ content, username: 'Aqued System', avatarURL: interaction.client.user.displayAvatarURL() });
	}
}
