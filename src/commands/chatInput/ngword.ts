import {
	ApplicationIntegrationType,
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	ChatInputCommandInteraction,
	DiscordAPIError,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { fileURLToPath } from 'node:url';
import { constants } from '../../config/constants.js';
import { SettingManager } from '../../core/SettingManager.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { GuildSetting } from '../../database/entities/GuildSetting.js';
import { failEmbed, successEmbed } from '../../embeds/infosEmbed.js';
import { errorReport } from '../../utils/errorReporter.js';
import { translatePermission } from '../../utils/translatePermission.js';
import { userFormat } from '../../utils/userFormat.js';
type Rule = {
	name: string;
	value: 'invite-link' | 'token' | 'mention' | 'email';
};
export default class NgWord implements ChatInputCommand {
	public command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
	public settings: CommandSetting;
	get rules(): Rule[] {
		return [
			{ name: '招待リンク(おすすめ)', value: 'invite-link' },
			{ name: 'トークン(おすすめ)', value: 'token' },
			{ name: '全員メンション', value: 'mention' },
			{ name: 'メールアドレス', value: 'email' }
		];
	}
	getRuleRegex(ruleName: 'invite-link' | 'token' | 'mention' | 'email') {
		const data = {
			'invite-link': [
				constants.regexs.inviteUrls.dicoall,
				constants.regexs.inviteUrls.disboard,
				constants.regexs.inviteUrls.discoparty,
				constants.regexs.inviteUrls.discordApp,
				constants.regexs.inviteUrls.discordGg,
				constants.regexs.inviteUrls.discord,
				constants.regexs.inviteUrls.discordCafe,
				constants.regexs.inviteUrls.dissoku,
				constants.regexs.inviteUrls.sabach,
				constants.regexs.inviteUrls.distopia
			],
			'token': [constants.regexs.discordToken],
			'mention': [constants.regexs.mention],
			'email': [constants.regexs.email]
		};
		return data[ruleName].map((regex) => `${regex}`);
	}
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('ngword')
			.setDescription('NGワード関連コマンド')
			.addSubcommand((input) =>
				input
					.setName('add')
					.setDescription('AutoModにAquedが提供するルールを追加します')
					.addStringOption((input) =>
						input.setName('rule').setDescription('ルール').addChoices(this.rules).setRequired(true)
					)
			)
			.addSubcommand((input) =>
				input
					.setName('remove')
					.setDescription('AutoModからAquedが提供するルールを削除します')
					.addStringOption((input) =>
						input.setName('rule').setDescription('ルール').addChoices(this.rules).setRequired(true)
					)
			)
			.setContexts(InteractionContextType.Guild)
			.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
			.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

		this.settings = { enable: true, permissions: [PermissionFlagsBits.ManageGuild], guildOnly: true };
	}
	isValidValue(value: string): value is Rule['value'] {
		return this.rules.some((rule) => rule.value === value);
	}

	async run(interaction: ChatInputCommandInteraction) {
		const commandName = interaction.options.getSubcommand();
		const ruleName = interaction.options.getString('rule');
		if (!ruleName || !commandName || !interaction.inCachedGuild()) {
			return;
		}
		if (!this.isValidValue(ruleName)) {
			return await interaction.reply({ content: 'ルールが存在しません', flags: [MessageFlags.Ephemeral] });
		}
		const settings = new SettingManager({ guildId: interaction.guildId });
		const setting = (await settings.getGuild()) ?? new GuildSetting(interaction.guildId);
		switch (commandName) {
			case 'add': {
				try {
					const rule = await interaction.guild.autoModerationRules.create({
						name: `${ruleName} By Aqued`,
						eventType: AutoModerationRuleEventType.MessageSend,
						triggerType: AutoModerationRuleTriggerType.Keyword,
						triggerMetadata: {
							regexPatterns: this.getRuleRegex(ruleName).map((value) => String(value))
						},
						actions: [{ type: AutoModerationActionType.BlockMessage }],
						enabled: true,
						reason: `${userFormat(interaction.member)}によって作成されました`
					});
					const autoMods: string[] = setting.autoMods ?? [];
					autoMods.push(rule.id);
					await settings.updateGuild({ autoMods });
				} catch (error) {
					if (error instanceof DiscordAPIError) {
						if (error.message.includes('AUTO_MODERATION_MAX_RULES_OF_TYPE_EXCEEDED')) {
							return await interaction.reply({
								embeds: [failEmbed('このサーバーには既に6つのキーワードルールがあります', 'ルール数制限')],
								flags: [MessageFlags.Ephemeral]
							});
						} else if (error.status === 403) {
							return await interaction.reply({
								embeds: [
									failEmbed(
										`botに${translatePermission([PermissionFlagsBits.ManageGuild])}の権限がありません`,
										'権限不足'
									)
								],
								flags: [MessageFlags.Ephemeral]
							});
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
								],
								flags: [MessageFlags.Ephemeral]
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
							],
							flags: [MessageFlags.Ephemeral]
						});
					}
				}
				return await interaction.reply({ embeds: [successEmbed('設定しました!')], flags: [MessageFlags.Ephemeral] });
			}

			case 'remove': {
				if (!setting.autoMods || setting.autoMods.length === 0) {
					return await interaction.reply({
						content: 'AutoModがAquedによって登録されていません',
						flags: [MessageFlags.Ephemeral]
					});
				}

				let removedCount = 0;
				for (const id of setting.autoMods) {
					const rule = interaction.guild.autoModerationRules.cache.find(
						(value) => value.id === id && value.name === `${ruleName} By Aqued`
					);

					if (rule) {
						await rule.delete(`${userFormat(interaction.member)}によって${rule.name}が削除されました`);
						const index = setting.autoMods.indexOf(id);
						if (index !== -1) {
							setting.autoMods.splice(index, 1);
							removedCount++;
						}
					}
				}

				if (removedCount > 0) {
					await settings.updateGuild({ autoMods: setting.autoMods });
					return await interaction.reply(`削除しました (${removedCount} 件のルール)`);
				} else {
					return await interaction.reply({
						content: '削除するルールが見つかりませんでした',
						flags: [MessageFlags.Ephemeral]
					});
				}
			}

			default:
				return;
		}
	}
}
