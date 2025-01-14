import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	DiscordAPIError,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { fileURLToPath } from 'node:url';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed, successEmbed } from '../../embeds/infosEmbed.js';
import { errorReport } from '../../utils/errorReporter.js';
import { userFormat } from '../../utils/userFormat.js';

export default class Moderate implements ChatInputCommand {
	public command: SlashCommandSubcommandsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('moderate')
			.setDescription('モデレート系コマンド')
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
								{ name: '削除しない', value: 0 }
							)
					)
			)
			.addSubcommand((input) =>
				input
					.setName('kick')
					.setDescription('ユーザーをkickします。')
					.addUserOption((input) => input.setName('user').setDescription('kickするユーザー').setRequired(true))
					.addStringOption((input) => input.setName('reason').setDescription('kickする理由').setRequired(false))
			)
			.addSubcommand((input) =>
				input
					.setName('unban')
					.setDescription('ユーザーのbanを解除します。')
					.addUserOption((input) => input.setName('user').setDescription('ban解除するユーザー').setRequired(true))
					.addStringOption((input) => input.setName('reason').setDescription('ban解除する理由').setRequired(false))
			)
			.addSubcommand((input) =>
				input
					.setName('timeout')
					.setDescription('ユーザーをタイムアウトします。')
					.addUserOption((input) => input.setName('user').setDescription('タイムアウトするユーザー').setRequired(true))
					.addIntegerOption((input) =>
						input.setName('time').setDescription('タイムアウトする期間(分単位)').setRequired(true).setMaxValue(40_000)
					)
					.addStringOption((input) => input.setName('reason').setDescription('タイムアウトする理由').setRequired(false))
			)
			.addSubcommand((input) =>
				input
					.setName('untimeout')
					.setDescription('ユーザーのタイムアウトを解除します。')
					.addUserOption((input) =>
						input.setName('user').setDescription('タイムアウトを解除するユーザー').setRequired(true)
					)
					.addStringOption((input) =>
						input.setName('reason').setDescription('タイムアウトを解除する理由').setRequired(false)
					)
			)
			.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.Guild]);
		this.settings = {
			enable: true,
			guildOnly: true,
			permissions: [
				PermissionFlagsBits.KickMembers,
				PermissionFlagsBits.BanMembers,
				PermissionFlagsBits.ModerateMembers
			]
		};
	}
	async run(interaction: ChatInputCommandInteraction) {
		const commandName = interaction.options.getSubcommand();
		if (!interaction.guild) {
			return await interaction.reply({ embeds: [failEmbed('サーバー以外では実行できません')] });
		}
		if (commandName === 'ban_member') {
			const bans = await interaction.guild.bans.fetch();
			const userList = bans.map((banData) => userFormat(banData.user)).join('\n') || 'Banされたユーザーはいません。';
			if (userList.length > 4096) {
				const userList2 = userList.substring(4096, userList.length);
				return await interaction.reply({
					embeds: [infoEmbed(userList, 'Banされたユーザー一覧'), infoEmbed(userList2, 'Banされたユーザー一覧')]
				});
			} else {
				return await interaction.reply({
					embeds: [infoEmbed(userList, 'Banされたユーザー一覧')]
				});
			}
		} else if (commandName === 'ban') {
			const user = interaction.options.getUser('user');
			if (!user) {
				return await interaction.reply({ embeds: [failEmbed('ユーザーが指定されていません')] });
			}
			const member = interaction.guild.members.cache.get(user.id);

			const runUser = interaction.guild.members.cache.get(interaction.user.id);
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Ban不可')] });
			}
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Ban不可')] });
			}
			if (member) {
				if (interaction.guild.ownerId !== interaction.user.id) {
					if (runUser.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
						return await interaction.reply({
							embeds: [failEmbed('あなたと同等以上のロールをもつメンバーをBanすることはできません', 'Ban不可')]
						});
					}
				}
				if (!member.bannable) {
					return await interaction.reply({
						embeds: [failEmbed('Botが該当ユーザーをBanすることができません', 'Ban不可')]
					});
				}
			}
			let reason = `実行者: ${userFormat(runUser)}`;
			const rawReason = interaction.options.getString('reason');
			if (rawReason) {
				reason = `${rawReason}, ${reason}`;
			}
			try {
				await interaction.guild.bans.create(user, {
					reason,
					deleteMessageSeconds: interaction.options.getInteger('delete_message') ?? 0
				});
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						return await interaction.reply({
							embeds: [failEmbed('Botが対象ユーザーをBanできませんでした', '権限不足')]
						});
					} else if (error.status === 404) {
						return await interaction.reply({
							embeds: [failEmbed('対象ユーザーが見つかりませんでした')]
						});
					}
				} else {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					return await interaction.reply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			return await interaction.reply({ embeds: [successEmbed(`**${userFormat(user)}** をBanしました`)] });
		} else if (commandName === 'unban') {
			const user = interaction.options.getUser('user');
			if (!user) {
				return await interaction.reply({ embeds: [failEmbed('ユーザーが指定されていません')] });
			}

			const runUser = interaction.guild.members.cache.get(interaction.user.id);
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Ban解除不可')] });
			}
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Ban解除不可')] });
			}

			let reason = `実行者: ${userFormat(runUser)}`;
			const rawReason = interaction.options.getString('reason');
			if (rawReason) {
				reason = `${rawReason}, ${reason}`;
			}
			try {
				await interaction.guild.bans.remove(user.id, reason);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						return await interaction.reply({
							embeds: [failEmbed('Botが対象ユーザーをBan解除できませんでした', '権限不足')]
						});
					} else if (error.status === 404) {
						return await interaction.reply({
							embeds: [failEmbed('対象ユーザーはBanされていません')]
						});
					}
				} else {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					return await interaction.reply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			return await interaction.reply({ embeds: [successEmbed(`**${userFormat(user)}** をBan解除しました`)] });
		} else if (commandName === 'kick') {
			const user = interaction.options.getUser('user');
			if (!user) {
				return await interaction.reply({ embeds: [failEmbed('ユーザーが指定されていません')] });
			}
			const member = interaction.guild.members.cache.get(user.id);
			if (!member) {
				return await interaction.reply({
					embeds: [failEmbed('このユーザーはこのサーバーに参加していません', 'Kick不可')]
				});
			}
			const runUser = interaction.guild.members.cache.get(interaction.user.id);
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Kick不可')] });
			}
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'Kick不可')] });
			}
			if (interaction.guild.ownerId !== interaction.user.id) {
				if (runUser.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
					return await interaction.reply({
						embeds: [failEmbed('あなたと同等以上のロールをもつメンバーをKickすることはできません', 'Kick不可')]
					});
				}
			}
			if (!member.kickable) {
				return await interaction.reply({
					embeds: [failEmbed('Botが該当ユーザーをKickすることができません', 'Kick不可')]
				});
			}
			let reason = `実行者: ${userFormat(runUser)}`;
			const rawReason = interaction.options.getString('reason');
			if (rawReason) {
				reason = `${rawReason}, ${reason}`;
			}
			try {
				await member.kick(reason);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						return await interaction.reply({
							embeds: [failEmbed('Botが対象ユーザーをKickできませんでした', '権限不足')]
						});
					}
				} else {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					return await interaction.reply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			return await interaction.reply({ embeds: [successEmbed(`**${userFormat(user)}** をKickしました`)] });
		} else if (commandName === 'timeout') {
			const user = interaction.options.getUser('user');
			const rawTime = interaction.options.getInteger('time');
			if (!rawTime) {
				return await interaction.reply({ embeds: [failEmbed('時間が指定されていません')] });
			}
			const time = rawTime * 60 * 1000;
			if (!user) {
				return await interaction.reply({ embeds: [failEmbed('ユーザーが指定されていません')] });
			}
			const member = interaction.guild.members.cache.get(user.id);
			if (!member) {
				return await interaction.reply({
					embeds: [failEmbed('このユーザーはこのサーバーに参加していません', 'タイムアウト不可')]
				});
			}
			const runUser = interaction.guild.members.cache.get(interaction.user.id);
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'タイムアウト不可')] });
			}
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'タイムアウト不可')] });
			}
			if (interaction.guild.ownerId !== interaction.user.id) {
				if (runUser.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
					return await interaction.reply({
						embeds: [
							failEmbed('あなたと同等以上のロールをもつメンバーをタイムアウトすることはできません', 'タイムアウト不可')
						]
					});
				}
			}
			if (!member.moderatable) {
				return await interaction.reply({
					embeds: [failEmbed('Botが該当ユーザーをタイムアウトすることができません', 'タイムアウト不可')]
				});
			}
			let reason = `実行者: ${userFormat(runUser)}`;
			const rawReason = interaction.options.getString('reason');
			if (rawReason) {
				reason = `${rawReason}, ${reason}`;
			}

			try {
				await member.timeout(time, reason);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						return await interaction.reply({
							embeds: [failEmbed('Botが対象ユーザーをタイムアウトできませんでした', '権限不足')]
						});
					}
				} else {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					return await interaction.reply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			return await interaction.reply({ embeds: [successEmbed(`**${userFormat(user)}** をタイムアウトしました`)] });
		} else if (commandName === 'untimeout') {
			const user = interaction.options.getUser('user');

			if (!user) {
				return await interaction.reply({ embeds: [failEmbed('ユーザーが指定されていません')] });
			}
			const member = interaction.guild.members.cache.get(user.id);
			if (!member) {
				return await interaction.reply({
					embeds: [failEmbed('このユーザーはこのサーバーに参加していません', 'タイムアウト不可')]
				});
			}
			const runUser = interaction.guild.members.cache.get(interaction.user.id);
			if (!runUser) {
				return await interaction.reply({ embeds: [failEmbed('実行者が取得できませんでした', 'タイムアウト解除不可')] });
			}
			if (interaction.guild.ownerId !== interaction.user.id) {
				if (runUser.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
					return await interaction.reply({
						embeds: [
							failEmbed(
								'あなたと同等以上のロールをもつメンバーをタイムアウト解除することはできません',
								'タイムアウト解除不可'
							)
						]
					});
				}
			}
			if (!member.moderatable) {
				return await interaction.reply({
					embeds: [failEmbed('Botが該当ユーザーをタイムアウト解除することができません', 'タイムアウト解除不可')]
				});
			}
			let reason = `実行者: ${userFormat(runUser)}`;
			const rawReason = interaction.options.getString('reason');
			if (rawReason) {
				reason = `${rawReason}, ${reason}`;
			}

			try {
				await member.timeout(null, reason);
			} catch (error) {
				if (error instanceof DiscordAPIError) {
					if (error.status === 403) {
						return await interaction.reply({
							embeds: [failEmbed('Botが対象ユーザーをタイムアウト解除できませんでした', '権限不足')]
						});
					}
				} else {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						interaction.channel!,
						interaction.user,
						error,
						interaction.commandName
					);
					return await interaction.reply({
						embeds: [
							failEmbed(
								`不明なエラーが発生しました\nエラーID: ${errorId}\nサポートサーバーにてエラーIDをご連絡ください\nhttps://discord.gg/PTPeAzwYdn`
							)
						]
					});
				}
			}
			return await interaction.reply({
				embeds: [successEmbed(`**${userFormat(user)}** のタイムアウトを解除しました`)]
			});
		} else {
			return;
		}
	}
}
