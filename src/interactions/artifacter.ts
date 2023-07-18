import { AttachmentBuilder, BaseInteraction, Colors, EmbedBuilder } from 'discord.js';
import { writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import './artifacter/keep.js';
export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.includes('select_build1_uid_')) return;
	const database = interaction.client.botData.artifacter;
	await interaction.deferReply();
	const response = await fetch(
		`https://artifacter.mikn.dev/?uid=${interaction.customId.replace('select_build1_uid_', '')}&character=${
			interaction.values[0]
		}&calcmethod=${await database.get(interaction.customId.replace('select_build1_uid_', ''))}`,
	);
	if (response.ok) {
		writeFileSync(
			'dist/src/interactions/artifacter/' + interaction.id + '.png',
			Buffer.from(await response.arrayBuffer()),
		);
	} else {
		return await interaction.editReply({
			embeds: [
				new EmbedBuilder().setTitle(':x: 失敗').setDescription('画像の生成に失敗しました。').setColor(Colors.Red),
			],
		});
	}
	await interaction.editReply({
		files: [
			new AttachmentBuilder(dirname(fileURLToPath(import.meta.url)) + '/artifacter/' + interaction.id + '.png', {
				name: 'artifacter.png',
			}),
		],
	});
}
