import { BaseInteraction } from 'discord.js';

export interface MemoData {
	id: number;
	title: string;
	value?: string;
}

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'memo_crud_create') return;
	try {
		const database = interaction.client.botData.memo;
		const beforeData: MemoData[] = (await database.get(interaction.user.id)) ?? [];
		const title = interaction.fields.getTextInputValue('title');
		const value = interaction.fields.getTextInputValue('value');
		const id = (beforeData[beforeData.length - 1]?.id ?? 0) + 1;
		const data: MemoData = {
			title,
			id,
			value,
		};

		await database.set(interaction.user.id, [...beforeData, data]);
		return await interaction.ok('成功', `メモの作成に成功しました。\nメモID: ${id}`, true);
	} catch (error) {
		console.error(error);
		return await interaction.error('失敗', 'メモの作成に失敗しました', true);
	}
}
