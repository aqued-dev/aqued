import { BaseInteraction, Colors, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) return;
	if (interaction.customId !== 'rolepanelselect') return;
	await interaction.deferReply({ ephemeral: true });
	for (const value of interaction.values) {
		const roles = interaction.guild.members.cache.get(interaction.user.id).roles.cache.has(value);
		if (!roles) await interaction.guild.members.cache.get(interaction.user.id).roles.add(value);
		else continue;
	}
	await interaction.editReply({
		embeds: [
			new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('✅ 付与しました。')
				.setDescription('ロールの付与に成功しました。'),
		],
	});
	await interaction.update({
		components: [
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder()
					.setPlaceholder('取得したいロールを選択してください...')
					.setCustomId('rolepanelselect')
					.setMaxValues(interaction.values.length)
					.addOptions(
						interaction.values
							.filter((value) => interaction.guild.roles.cache.has(value))
							.map((value) => ({ label: interaction.guild.roles.cache.get(value).name, value: value })),
					),
			),
		],
	});
}