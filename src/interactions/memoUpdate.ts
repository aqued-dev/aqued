import { BaseInteraction } from 'discord.js';
import { MemoData } from './memoCreate.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith('memo_crud_update_')) return;
	try {
		const database = interaction.client.botData.memo;
		const beforeData: MemoData[] = (await database.get(interaction.user.id)) ?? [];

		const id = interaction.customId.replace('memo_crud_update_', '');
		const title = interaction.fields.getTextInputValue('title');
		const value = interaction.fields.getTextInputValue('value');
		const data: MemoData = {
			title,
			id: Number(id),
			value,
		};

		const index = beforeData.findIndex((memo) => String(memo.id) === id);
		if (index === -1) {
			return await interaction.error(
				'失敗',
				'編集しようとしたメモは見つかりませんでした。削除された可能性があります。',
				true,
			);
		}
		beforeData[index] = data;
		await database.set(interaction.user.id, beforeData);
		return await interaction.ok('成功', `メモの編集に成功しました`, true);
	} catch {
		return await interaction.error('失敗', 'メモの編集処理中にエラーが発生しました', true);
	}
}
