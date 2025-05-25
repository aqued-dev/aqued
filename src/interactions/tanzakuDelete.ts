import { BaseInteraction, Colors, EmbedBuilder } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isButton() && interaction.customId.startsWith('tanzaku_delete')) {
		if (interaction.user.id === interaction.customId.replace('tanzaku_delete', '')) {
			interaction.update({
				embeds: [
					new EmbedBuilder()
						.setTitle('🎋短冊')
						.setDescription(
							`[🗑️**${
								interaction.user.discriminator === '0'
									? `@${interaction.user.username}`
									: `${interaction.user.username}#${interaction.user.discriminator}`
							}** により削除済み]`,
						)
						.setColor(Colors.Blue),
				],
				components: [],
			});
		} else {
			return await interaction.error('操作不可', 'コマンドを実行した本人以外は操作できません', true);
		}
	}
}
