import { BaseInteraction, Colors, EmbedBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) return;
	if (interaction.customId !== 'rolepanelselect') return;
	await interaction.deferReply({ ephemeral: true });
	for (const value of interaction.values) {
		const roles = interaction.guild.members.cache.get(interaction.user.id).roles.cache.has(value);
		if (roles) await interaction.guild.members.cache.get(interaction.user.id).roles.add(value);
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
}
