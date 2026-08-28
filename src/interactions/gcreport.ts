import { BaseInteraction, User, WebhookClient } from 'discord.js';
import { userFormat } from '../utils/userFormat.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;
	if (interaction.customId.startsWith('newGlobalChatMessages_delete_')) {
		const mId = interaction.customId.replace('newGlobalChatMessages_delete_', '');
		const { register, messages } = interaction.client.botData.newGlobalChat;

		const registers = await register.list();

		for (const registedData of registers) {
			const key = registedData.key;
			const value = registedData.value;

			const webhook = new WebhookClient({ id: value.webhook.id, token: value.webhook.token });

			const message = await messages.get(mId);
			const relayMessage = message?.relays?.find((d) => d.channelId === key);
			if (!relayMessage) continue;

			await webhook.deleteMessage(relayMessage.id);
		}
		await messages.delete(mId);
		await interaction.update({ components: [], content: `削除しました。\n実行者: ${userFormat(interaction.user)}` });
	} else if (interaction.customId === 'newGlobalChatMessages_abandoned') {
		await interaction.update({ components: [], content: `否決しました。\n実行者: ${userFormat(interaction.user)}` });
	}
}
