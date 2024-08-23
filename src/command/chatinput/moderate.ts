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
		.addSubcommand((input) => input.setName('ban_member').setDescription('Banされたメンバー一覧を表示します。'))
		.addSubcommand((input) =>
			input
				.setName('ban')
				.setDescription('ユーザーをBanします。')
				.addUserOption((input) => input.setName('user').setDescription('Banするユーザー').setRequired(true))
				.addStringOption((input) => input.setName('reason').setDescription('Banする理由').setRequired(false))
				.addIntegerOption((input) =>
					input
						.setName('delete_message')
						.setDescription('どこまでのメッセージを削除するか')
						.setRequired(false)
						.addChoices(
							{ name: '1時間', value: 60 * 60 * 1000 },
							{ name: '6時間', value: 6 * 60 * 60 * 1000 },
							{ name: '12時間', value: 12 * 60 * 60 * 1000 },
							{ name: '24時間', value: 24 * 60 * 60 * 1000 },
							{ name: '3日間', value: 3 * 24 * 60 * 60 * 1000 },
							{ name: '1週間', value: 7 * 24 * 60 * 60 * 1000 },
							{ name: '削除しない', value: 0 },
						),
				),
		)
		.addSubcommand((input) =>
			input
				.setName('kick')
				.setDescription('ユーザーをkickします。')
				.addUserOption((input) => input.setName('user').setDescription('kickするユーザー').setRequired(true))
				.addStringOption((input) => input.setName('reason').setDescription('kickする理由').setRequired(false)),
		)
		.addSubcommand((input) =>
			input
				.setName('unban')
				.setDescription('ユーザーのbanを解除します。')
				.addUserOption((input) => input.setName('user').setDescription('ban解除するユーザー').setRequired(true))
				.addStringOption((input) => input.setName('reason').setDescription('ban解除する理由').setRequired(false)),
		)
		.addSubcommand((input) =>
			input
				.setName('timeout')
				.setDescription('ユーザーをタイムアウトします。')
				.addUserOption((input) => input.setName('user').setDescription('タイムアウトするユーザー').setRequired(true))
				.addIntegerOption((input) =>
					input.setName('time').setDescription('タイムアウトする期間(分単位)').setRequired(true).setMaxValue(40_000),
				)
				.addStringOption((input) => input.setName('reason').setDescription('タイムアウトする理由').setRequired(false)),
		)
		.addSubcommand((input) =>
			input
				.setName('untimeout')
				.setDescription('ユーザーのタイムアウトを解除します。')
				.addUserOption((input) =>
					input.setName('user').setDescription('タイムアウトを解除するユーザー').setRequired(true),
				)
				.addStringOption((input) =>
					input.setName('reason').setDescription('タイムアウトを解除する理由').setRequired(false),
				),
		),

	ownersOnly: true,
	modOnly: false,
	permissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ModerateMembers],

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'ban_member': {
				const bans = await interaction.guild.bans.fetch();
				const users =
					bans
						.map((Ban) =>
							Ban.user.discriminator === '0'
								? `@${Ban.user.username}`
								: `${Ban.user.username}#${Ban.user.discriminator}`,
						)
						.join('\n') || 'Banされたユーザーはいません。';
				if (users.length > 4096) {
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
			case 'ban': {
				const user = interaction.options.getUser('user');
				const member = interaction.guild.members.cache.get(user.id);
				if (!member)
					return await interaction.error(
						'このユーザーはBanできません。',
						'このユーザーはこのサーバーに参加していません。',
						true,
					);
				if (
					interaction.guild.ownerId !== interaction.user.id &&
					interaction.guild.members.cache
						.get(interaction.user.id)
						.roles.highest.comparePositionTo(member.roles.highest) <= 0
				) {
					return await interaction.error(
						'このユーザーはBanできません。',
						'あなたと同等以上の役職をもつメンバーをBanすることはできません',
						true,
					);
				}
				if (!member.bannable)
					return await interaction.error(
						'このユーザーはBanできません。',
						'botがこのユーザーをBanする権限を持っていません。',
						true,
					);
				await member
					.ban({
						reason: interaction.options.getString('reason')
							? `${interaction.options.getString('reason')} | Banコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`
							: `Banコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`,
						deleteMessageSeconds: interaction.options.getInteger('delete_message') || 0,
					})
					.then(
						async () =>
							await interaction.ok(
								'Banしました。',
								`${
									user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`
								}をBanしました。`,
								false,
							),
					);
				break;
			}
			case 'kick': {
				const user = interaction.options.getUser('user');
				const member = interaction.guild.members.cache.get(user.id);
				if (!member)
					return await interaction.error(
						'このユーザーはkickできません。',
						'このユーザーはこのサーバーに参加していません。',
						true,
					);
				if (
					interaction.guild.ownerId !== interaction.user.id &&
					interaction.guild.members.cache
						.get(interaction.user.id)
						.roles.highest.comparePositionTo(member.roles.highest) <= 0
				) {
					return await interaction.error(
						'このユーザーはkickできません。',
						'あなたと同等以上の役職をもつメンバーをkickすることはできません',
						true,
					);
				}
				if (!member.kickable)
					return await interaction.error(
						'このユーザーはkickできません。',
						'botがこのユーザーをkickする権限を持っていません。',
						true,
					);
				await member
					.kick(
						interaction.options.getString('reason')
							? `${interaction.options.getString('reason')} | kickコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`
							: `kickコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`,
					)
					.then(
						async () =>
							await interaction.ok(
								'kickしました。',
								`${
									user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`
								}をkickしました。`,
								false,
							),
					);
				break;
			}
			case 'unban': {
				const user = interaction.options.getUser('user');
				const member = interaction.guild.members.cache.get(user.id);
				if (!member)
					return await interaction.error(
						'このユーザーはban解除できません。',
						'このユーザーはこのサーバーに参加していません。',
						true,
					);
				if (
					interaction.guild.ownerId !== interaction.user.id &&
					interaction.guild.members.cache
						.get(interaction.user.id)
						.roles.highest.comparePositionTo(member.roles.highest) <= 0
				) {
					return await interaction.error(
						'このユーザーはban解除できません。',
						'あなたと同等以上の役職をもつメンバーをban解除することはできません',
						true,
					);
				}
				if (!member.bannable)
					return await interaction.error(
						'このユーザーはban解除できません。',
						'botがこのユーザーをban解除する権限を持っていません。',
						true,
					);
				await member.guild.bans
					.remove(
						member.id,
						interaction.options.getString('reason')
							? `${interaction.options.getString('reason')} | ban解除コマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`
							: `ban解除コマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`,
					)
					.then(
						async () =>
							await interaction.ok(
								'ban解除しました。',
								`${
									user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`
								}のbanを解除しました。`,
								false,
							),
					);
				break;
			}
			case 'timeout': {
				const user = interaction.options.getUser('user');
				const time = interaction.options.getInteger('time') * 60 * 1000;
				const member = interaction.guild.members.cache.get(user.id);
				if (!member)
					return await interaction.error(
						'このユーザーはタイムアウトできません。',
						'このユーザーはこのサーバーに参加していません。',
						true,
					);
				if (
					interaction.guild.ownerId !== interaction.user.id &&
					interaction.guild.members.cache
						.get(interaction.user.id)
						.roles.highest.comparePositionTo(member.roles.highest) <= 0
				) {
					return await interaction.error(
						'このユーザーはタイムアウトできません。',
						'あなたと同等以上の役職をもつメンバーをタイムアウトすることはできません',
						true,
					);
				}
				if (!member.moderatable)
					return await interaction.error(
						'このユーザーはタイムアウトできません。',
						'botがこのユーザーをタイムアウトする権限を持っていません。',
						true,
					);
				await member
					.timeout(
						time,
						interaction.options.getString('reason')
							? `${interaction.options.getString('reason')} | タイムアウトコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`
							: `タイムアウトコマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`,
					)
					.then(
						async () =>
							await interaction.ok(
								'タイムアウトしました。',
								`${
									user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`
								}をタイムアウトしました。`,
								false,
							),
					);
				break;
			}
			case 'untimeout': {
				const user = interaction.options.getUser('user');
				const member = interaction.guild.members.cache.get(user.id);
				if (!member)
					return await interaction.error(
						'このユーザーはタイムアウト解除できません。',
						'このユーザーはこのサーバーに参加していません。',
						true,
					);
				if (
					interaction.guild.ownerId !== interaction.user.id &&
					interaction.guild.members.cache
						.get(interaction.user.id)
						.roles.highest.comparePositionTo(member.roles.highest) <= 0
				) {
					return await interaction.error(
						'このユーザーはタイムアウト解除できません。',
						'あなたと同等以上の役職をもつメンバーをタイムアウト解除することはできません',
						true,
					);
				}
				if (!member.moderatable)
					return await interaction.error(
						'このユーザーはタイムアウト解除できません。',
						'botがこのユーザーをタイムアウト解除する権限を持っていません。',
						true,
					);
				await member
					.timeout(
						null,
						interaction.options.getString('reason')
							? `${interaction.options.getString('reason')} | タイムアウト解除コマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`
							: `タイムアウト解除コマンド実行者: ${
									interaction.user.discriminator === '0'
										? `@${interaction.user.username}`
										: `${interaction.user.username}#${interaction.user.discriminator}`
								}`,
					)
					.then(
						async () =>
							await interaction.ok(
								'タイムアウトを解除しました。',
								`${
									user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`
								}のタイムアウトを解除しました。`,
								false,
							),
					);
				break;
			}
		}
	},
};
