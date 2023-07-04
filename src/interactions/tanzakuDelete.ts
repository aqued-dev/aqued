import { BaseInteraction, EmbedBuilder, Colors } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isButton() && interaction.customId === 'tanzaku_delete') {
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
	}
}
