import { BaseInteraction, WebhookClient } from 'discord.js';
import { userFormat } from '../utils/userFormat.js';

const CONCURRENCY = 10;

export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;

	if (interaction.customId.startsWith('newGlobalChatMessages_delete_')) {
		const mId = interaction.customId.replace('newGlobalChatMessages_delete_', '');
		const { register, messages } = interaction.client.botData.newGlobalChat;

		const [registers, message] = await Promise.all([register.list(), messages.get(mId)]);

		const targets = registers
			.map(({ key, value }) => ({
				webhookId: value.webhook.id,
				webhookToken: value.webhook.token,
				relayMessageId: message?.relays?.find((d) => d.channelId === key)?.id,
			}))
			.filter((t): t is typeof t & { relayMessageId: string } => !!t.relayMessageId);

		// 5件ずつのチャンクに分割して順番に処理
		for (let i = 0; i < targets.length; i += CONCURRENCY) {
			const chunk = targets.slice(i, i + CONCURRENCY);
			await Promise.allSettled(
				chunk.map(async ({ webhookId, webhookToken, relayMessageId }) => {
					const webhook = new WebhookClient({ id: webhookId, token: webhookToken });
					await webhook.deleteMessage(relayMessageId);
				})
			);
		}

		await messages.delete(mId);
		await interaction.update({
			components: [],
			content: `削除しました。\n実行者: ${userFormat(interaction.user)}`,
		});
	} else if (interaction.customId === 'newGlobalChatMessages_abandoned') {
		await interaction.update({
			components: [],
			content: `否決しました。\n実行者: ${userFormat(interaction.user)}`,
		});
	}
}