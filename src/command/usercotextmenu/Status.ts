/* eslint-disable unicorn/no-nested-ternary */
import {
	ApplicationCommandType,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	UserContextMenuCommandInteraction,
} from 'discord.js';
export default {
	command: new ContextMenuCommandBuilder().setName('UserStatus').setType(ApplicationCommandType.User),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: UserContextMenuCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(
						`${
							interaction.targetUser.discriminator === '0'
								? `@${interaction.targetUser.username}`
								: interaction.targetUser.tag
						}のステータス`,
					)
					.setDescription(
						interaction.targetUser
							.extPresence()
							.status.replace('offline', '<:offline:1125783729181298698> オフライン')
							.replace('invisible', '<:offline:1125783729181298698> オフライン')
							.replace('online', '<:online:1125783732721287281> オンライン')
							.replace('idle', '<:idle:1125783726966722660> 離席中')
							.replace('dnd', '<:dnd:1125783722571092112> 取り込み中'),
					)
					.setColor(Colors.Blue),
			],
		});
	},
};
