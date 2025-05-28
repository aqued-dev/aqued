import { BaseInteraction, Colors, EmbedBuilder, MessageFlags, roleMention } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isStringSelectMenu()) return;
	if (interaction.customId !== 'rolepanelselect') return;
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	const result: Record<'grant' | 'release' | 'fail', string[]> = { grant: [], release: [], fail: [] };
	for (const value of interaction.values) {
		const roles = interaction.guild.members.cache.get(interaction.user.id).roles.cache.has(value);
		try {
			if (!roles) {
				await interaction.guild.members.cache.get(interaction.user.id).roles.add(value);
				result.grant.push(value);
			} else {
				await interaction.guild.members.cache.get(interaction.user.id).roles.remove(value);
				result.release.push(value);
			}
		} catch {
			result.fail.push(value);
		}
	}
	const embed = new EmbedBuilder().setColor(Colors.Blue).setTitle('✅ 完了');
	if (result.grant.length !== 0) {
		embed.addFields({ name: '付与したロール', value: result.grant.map((id) => roleMention(id)).join('\n') });
	}
	if (result.release.length !== 0) {
		embed.addFields({ name: '解除したロール', value: result.release.map((id) => roleMention(id)).join('\n') });
	}
	if (result.fail.length !== 0) {
		embed.addFields({ name: '操作に失敗したロール', value: result.fail.map((id) => roleMention(id)).join('\n') });
	}

	await interaction.editReply({
		embeds: [embed],
	});

	await interaction.message.edit({
		components: interaction.message.components,
	});
}
