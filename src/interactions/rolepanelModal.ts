import { ActionRowBuilder, BaseInteraction, Colors, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isModalSubmit()) return;
	if (!interaction.customId.startsWith('role_panel_modal_')) return;
	const id = interaction.customId.replace('role_panel_modal_', '');
	let roles: undefined | ({ id: string; name: string } | null)[] = await interaction.client.botData.rolePanel.get(id);
	if (!roles) return await interaction.error('ロールパネル生成失敗', 'データ参照エラーです。', true);
	const title = interaction.fields.getTextInputValue('title') || 'ロールパネル';
	const description =
		interaction.fields.getTextInputValue('description') || '以下のセレクトメニューで、ロールを取得できます。';
	roles = roles.filter((value) => value !== null);
	const message = await interaction.reply({
		fetchReply: true,
		embeds: [
			new EmbedBuilder()
				.setTitle(title)
				.setDescription(description)
				.setColor(Colors.Blue)
				.addFields({
					name: 'ロール',
					value: roles
						.filter((value) => interaction.guild.roles.cache.has(value.id))
						.map((value, index) => `${index + 1}: <@&${value.id}>`)
						.join('\n'),
				}),
		],
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setPlaceholder('取得したいロールを選択してください...')
					.setCustomId('rolepanelselect')
					.setMaxValues(roles.filter((value) => interaction.guild.roles.cache.has(value.id)).length)
					.addOptions(
						roles
							.filter((value) => interaction.guild.roles.cache.has(value.id))
							.map((value) => ({ label: value.name, value: value.id })),
					),
			),
		],
	});
	await interaction.client.botData.rolePanelId.set(message.id, id);
}
