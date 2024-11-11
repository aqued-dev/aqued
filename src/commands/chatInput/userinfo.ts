import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	GuildMember,
	InteractionContextType,
	SlashCommandBuilder,
	time,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { infoEmbed } from '../../embeds/infosEmbed.js';
import { getFlags } from '../../utils/getFlags.js';
import { getPresence } from '../../utils/getPresence.js';
import { getStatusEmojiText } from '../../utils/getStatusEmoji.js';
import { translatePermission } from '../../utils/translatePermission.js';
import { userFormat } from '../../utils/userFormat.js';

export default class Ping implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('userinfo')
			.setDescription('ユーザーの情報を表示します')
			.addUserOption((input) => input.setName('user').setDescription('ユーザー/メンバー'))
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		let member: GuildMember | undefined = undefined;
		if (interaction.guild) {
			member = interaction.guild.members.cache.get(user.id);
		}
		const userName = userFormat(user);

		const normalFields: string[] = [
			`**名前**: ${userName}`,
			`**アカウント作成日時**: ${time(user.createdAt, 'F')}`,
			`アプリか: ${user.bot ? 'はい' : 'いいえ'}`,
			`システムか: ${user.system ? 'はい' : 'いいえ'}`,
			`ステータス: ${getStatusEmojiText(getPresence(user).status)}`,
			`フラグ: ${getFlags(user.flags)}`
		];

		const embed = infoEmbed(undefined, userName).addFields({ name: '基本情報', value: normalFields.join('\n') });
		if (member) {
			const memberFields: string[] = [`**ニックネーム**: ${member.nickname ?? 'なし'}`];
			if (member.communicationDisabledUntil) {
				memberFields.push(`**タイムアウトが解除される日時**: ${time(member.communicationDisabledUntil, 'F')}`);
			}
			if (member.joinedAt) {
				memberFields.push(`**サーバー参加日時**: ${time(member.joinedAt, 'F')}`);
			}
			memberFields.push(`**権限**: \`${translatePermission(member.permissions.toArray()).join(", ")}\``);
			if (member.premiumSince) {
				memberFields.push(`**最後にブーストした日時**: ${time(member.premiumSince, 'F')}`);
			}
			embed.addFields({ name: 'メンバー情報', value: memberFields.join('\n') });
			if (member.avatar && member.avatar.startsWith('a_')) {
				embed.setThumbnail(member.displayAvatarURL({ extension: 'gif' }));
			} else {
				embed.setThumbnail(member.displayAvatarURL({ extension: 'png' }));
			}
		} else {
			if (user.avatar && user.avatar.startsWith('a_')) {
				embed.setThumbnail(user.displayAvatarURL({ extension: 'gif' }));
			} else {
				embed.setThumbnail(user.displayAvatarURL({ extension: 'png' }));
			}
		}
		await interaction.reply({ embeds: [embed] });
	}
}
