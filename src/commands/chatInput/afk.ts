import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { SettingManager } from '../../core/SettingManager.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import type { AFKMentionData, UserSetting } from '../../database/entities/UserSetting.js';
import { infoEmbed, successEmbed } from '../../embeds/infosEmbed.js';

export default class Afk implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('afk')
			.setDescription('afkを設定・解除します')
			.addStringOption((input) =>
				input.setName('reason').setDescription('メンション時に表示する理由').setRequired(false)
			)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	urlBuilder(guildId: string, channelId: string, messageId: string, threadId?: string) {
		const base = 'https://discord.com/channels';
		if (threadId) {
			return `${base}/${guildId}/${threadId}/${messageId}`;
		} else {
			return `${base}/${guildId}/${channelId}/${messageId}`;
		}
	}
	mentionData(mentionData: AFKMentionData[]) {
		const urls: string[] = [];
		for (const data of mentionData) {
			if (data.thread && data.channel) {
				const url = this.urlBuilder(data.guildId, data.channel.id, data.messageId, data.thread.id);
				urls.push(`[${data.guildName} > ${data.channel.name} > ${data.thread.name}](${url})`);
			} else if (data.channel) {
				const url = this.urlBuilder(data.guildId, data.channel.id, data.messageId);
				urls.push(`[${data.guildName} > ${data.channel.name}](${url})`);
			}
		}
		if (mentionData.length === 0) {
			urls.push('メンションはありませんでした');
		}
		const info = infoEmbed(urls.join('\n'), 'AFK中のメンション');
		return info;
	}
	async run(interaction: ChatInputCommandInteraction) {
		const setting = new SettingManager({ userId: interaction.user.id });
		const options: Partial<UserSetting> = {};
		const reason = interaction.options.getString('reason');
		if (reason) {
			options.afkReason = reason;
		}
		const userSetting = await setting.getUser();
		if (!userSetting || !userSetting.afk) {
			options.afk = true;
		} else {
			options.afk = false;
		}
		options.afkReason = null;
		options.afkMentions = [];
		await setting.updateUser(options);
		const base = new Afk();
		if (options.afk) {
			await interaction.reply({ embeds: [successEmbed('AFKになりました')] });
		} else {
			let mentions: AFKMentionData[] = [];
			if (userSetting && userSetting.afkMentions) {
				mentions = userSetting.afkMentions;
			}
			await interaction.reply({
				embeds: [successEmbed('AFKを解除しました'), base.mentionData(mentions ?? [])]
			});
		}
	}
}
