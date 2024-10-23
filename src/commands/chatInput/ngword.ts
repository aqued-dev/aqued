import {
	ApplicationIntegrationType,
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	ChatInputCommandInteraction,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { constants } from '../../config/constants.js';
import { SettingManager } from '../../core/SettingManager.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { GuildSetting } from '../../database/entities/GuildSetting.js';
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
				constants.regexs.inviteUrls.discord,
				constants.regexs.inviteUrls.discordCafe,
				constants.regexs.inviteUrls.dissoku,
				constants.regexs.inviteUrls.sabach
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
		if (!ruleName || !commandName || !interaction.inCachedGuild()) return;
		if (!this.isValidValue(ruleName)) {
			return await interaction.reply({ content: 'ルールが存在しません。', ephemeral: true });
		}
		const settings = new SettingManager({ guildId: interaction.guildId });
		const setting = (await settings.getGuild()) ?? new GuildSetting(interaction.guildId);
		switch (commandName) {
			case 'add': {
				const rule = await interaction.guild.autoModerationRules.create({
					name: `${ruleName} By Aqued`,
					eventType: AutoModerationRuleEventType.MessageSend,
					triggerType: AutoModerationRuleTriggerType.Keyword,
					triggerMetadata: {
						regexPatterns: this.getRuleRegex(ruleName).map((value) => String(value))
					},
					actions: [{ type: AutoModerationActionType.BlockMessage }],
					enabled: true,
					reason: `${userFormat(interaction.member)}によって作成されました。`
				});

				const autoMods: string[] = setting.autoMods ?? [];
				autoMods.push(rule.id);
				await settings.updateGuild({ autoMods });
				return await interaction.reply('登録しました！');
			}

			case 'remove': {
				if (!setting.autoMods || setting.autoMods.length === 0) {
					return await interaction.reply({ content: 'AutoModがAquedによって登録されていません', ephemeral: true });
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
					return await interaction.reply(`削除しました (${removedCount} 件のルール)。`);
				} else {
					return await interaction.reply({ content: '削除するルールが見つかりませんでした。', ephemeral: true });
				}
			}

			default:
				return;
		}
	}
}
