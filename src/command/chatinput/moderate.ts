import {
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('moderate')
		.setDescription('モデレート系コマンド')
		.setGuildOnly()
		.addSubcommand((input) => input.setName('ban_member').setDescription('banされたメンバー一覧を表示します。')),
	ownersOnly: true,
	modOnly: false,
	permissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ModerateMembers],

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'ban_member': {
				const bans = await interaction.guild.bans.fetch();
				const users =
					bans
						.map((ban) =>
							ban.user.discriminator === '0'
								? `@${ban.user.username}`
								: `${ban.user.username}#${ban.user.discriminator}`,
						)
						.join('\n') || 'Banされたユーザーはいません。';
				if (users.length > 4096) {
					// eslint-disable-next-line unicorn/prefer-string-slice
					const users2 = users.substring(4096, users.length);
					await interaction.reply({
						embeds: [
							new EmbedBuilder().setTitle('Banされたユーザー一覧').setDescription(users).setColor(Colors.Blue),
							new EmbedBuilder().setTitle('Banされたユーザー一覧').setDescription(users2).setColor(Colors.Blue),
						],
					});
				} else {
					await interaction.reply({
						embeds: [new EmbedBuilder().setTitle('Banされたユーザー一覧').setDescription(users).setColor(Colors.Blue)],
					});
				}
				break;
			}
		}
	},
};
