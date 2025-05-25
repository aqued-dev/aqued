import { BaseInteraction, Colors, EmbedBuilder } from 'discord.js';
export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;
	if (interaction.customId.startsWith('embed_ok_')) {
		if (interaction.customId.replace('embed_ok_', '') !== interaction.user.id) {
			return await interaction.error('操作不可', 'コマンドを実行した本人以外は操作できません', true);
		}
		return await interaction.update({ components: [] });
	} else if (interaction.customId.startsWith('embed_delete_')) {
		if (interaction.customId.replace('embed_delete_', '') !== interaction.user.id) {
			return await interaction.error('操作不可', 'コマンドを実行した本人以外は操作できません', true);
		}
		return await interaction.update({
			embeds: [
				new EmbedBuilder()
					.setTitle('Embed作成')
					.setDescription(
						`[🗑️**${
							interaction.user.discriminator === '0'
								? `@${interaction.user.username}`
								: `${interaction.user.username}#${interaction.user.discriminator}`
						}** により削除済み]`,
					)
					.setColor(Colors.Red),
			],
			components: [],
		});
	}
}
