import { BaseInteraction, ChannelType, Webhook } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'mod_globalchataquedsystem_modal') return;
	const content = interaction.fields.getTextInputValue('content');
	const registers = await interaction.client.botData.globalChat.register.keys();
	await interaction.ok('送信開始', '送信が開始しました。', true);
	for (const value of registers) {
		const channel = interaction.client.channels.cache.get(value);
		if (!channel) continue;
		if (channel.type !== ChannelType.GuildText) continue;
		const webhooks = await channel.fetchWebhooks();
		const webhook: Webhook =
			!webhooks.some((value) => value.name === 'Aqued') ||
			webhooks.find((value) => value.name === 'Aqued').owner.id !== interaction.client.user.id
				? await channel.createWebhook({ name: 'Aqued' })
				: webhooks.find((value) => value.name === 'Aqued');

		await webhook.send({
			content,
			avatarURL: interaction.client.user.displayAvatarURL({ extension: 'webp' }),
			username: 'Aqued System',
		});
	}
}
