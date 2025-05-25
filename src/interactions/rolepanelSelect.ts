import { BaseInteraction, Colors, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) return;
	if (interaction.customId !== 'rolepanelselect') return;
	await interaction.deferReply({ ephemeral: true });
	for (const value of interaction.values) {
		const roles = interaction.guild.members.cache.get(interaction.user.id).roles.cache.has(value);
		if (!roles) await interaction.guild.members.cache.get(interaction.user.id).roles.add(value);
		else await interaction.guild.members.cache.get(interaction.user.id).roles.remove(value);
	}
	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('✅ 成功')
				.setDescription('ロールの付与又は解除に成功しました。'),
		],
	});
	const options = (
		await Promise.all(
			interaction.values.map(async (value) => {
				const role = await interaction.guild.roles.fetch(value);
				if (!role) {
					return null;
				}
				return {
					label: role.name,
					value: value,
				};
			}),
		)
	).filter((option): option is { label: string; value: string } => option !== null);

	await interaction.message.edit({
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setPlaceholder('取得したいロールを選択してください...')
					.setCustomId('rolepanelselect')
					.setMaxValues(interaction.values.length)
					.addOptions(options),
			),
		],
	});
}
