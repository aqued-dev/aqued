/* eslint-disable unicorn/no-nested-ternary */
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder, time } from 'discord.js';
import { translatePermission } from '../../utils/permission.js';

export default {
	command: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('ユーザーの情報を表示します。')
		.addUserOption((input) => input.setName('user').setDescription('ユーザー')),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser('user') || interaction.user;
		const member = interaction.guild && interaction.guild.members.cache.get(user.id);
		const username = user.discriminator === '0' ? `@${user.username}` : `${user.username}#${user.discriminator}`;
		if (member) {
			const embed = new EmbedBuilder()
				.setTitle(`**${username}**の情報`)
				.setColor(Colors.Blue)
				.addFields(
					{
						name: '基本情報',
						value: `**名前**: ${user.globalName ? `${user.globalName}(${username})` : username}\n**ID**: \`${
							user.id
						}\`\n**アカウント作成日時**: ${time(user.createdAt, 'F')}\n**bot**: ${
							user.bot ? 'はい' : 'いいえ'
						}\n**system**: ${user.system ? 'はい' : 'いいえ'}\n**フラグ**: ${
							user.flags
								.toArray()
								.map((v) =>
									v
										.replaceAll('VerifiedDeveloper', '<:verified_bot_developer:1035780599404826645>')
										.replaceAll('PremiumEarlySupporter', '<:Discord_Early_Supporter:1027518349544005673>')
										.replaceAll('ActiveDeveloper', '<:ActiveDevloper:1082582737241776180>')
										.replaceAll('Staff', '<:Discord_Staff:1027518926957064212>')
										.replaceAll('Partner', '<:Partner_server:1028500801313833050>')
										.replaceAll('Hypesquad', '<:Discord_Hypesquad_Event:1027518774431191060>')
										.replaceAll('BugHunterLevel1', '<:Discord_Bug_Hunter:1027518144652255272>')
										.replaceAll('BugHunterLevel2', '<:Discord_Bug_Hunter:1027518144652255272>')
										.replaceAll('HypeSquadOnlineHouse1', '<:Discord_Hypesquad_Bravery:1027518564724379698>')
										.replaceAll('HypeSquadOnlineHouse2', '<:Discord_Hypesquad_Brilliance:1027518693128810496>')
										.replaceAll('HypeSquadOnlineHouse3', '<:Discord_Hypesquad_Balance:1027518440912728104>')
										.replaceAll('VerifiedBot', '<:verified_bot:1028499348792823818>')
										.replaceAll('CertifiedModerator', '<:DiscordCertifiedModerator:1082847714162786305>'),
								)
								.join(' ') || 'なし'
						}`,
						inline: false,
					},
					{
						name: 'サーバーメンバー情報',
						value: `**ニックネーム**: ${member.nickname || 'なし'}\n${
							member.communicationDisabledUntil
								? `**タイムアウトが解除される日時**:${time(member.communicationDisabledUntil, 'F')}`
								: ''
						}\n**サーバー参加日時**: ${time(member.joinedAt, 'F')}\n**権限**: \`${translatePermission(
							member.permissions.toArray(),
						).join(', ')}\`${
							member.premiumSince ? `**最後にブーストした日時**: ${time(member.premiumSince, 'F')}` : ''
						}`,
						inline: false,
					},
				);

			if (member.avatar) {
				member.avatar.startsWith('a_')
					? embed.setThumbnail(member.extDefaultAvatarURL({ extension: 'gif' }))
					: embed.setThumbnail(member.extDefaultAvatarURL({ extension: 'webp' }));
				user.avatar.startsWith('a_')
					? embed.setImage(user.extDefaultAvatarURL({ extension: 'gif' }))
					: embed.setImage(user.extDefaultAvatarURL({ extension: 'webp' }));
			} else if (user.avatar) {
				user.avatar.startsWith('a_')
					? embed.setThumbnail(user.extDefaultAvatarURL({ extension: 'gif' }))
					: embed.setThumbnail(user.extDefaultAvatarURL({ extension: 'webp' }));
			} else {
				embed.setThumbnail(user.extDefaultAvatarURL({ extension: 'webp' }));
			}

			await interaction.reply({
				embeds: [embed],
			});
		} else {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`**${username}**の情報`)
						.setColor(Colors.Blue)
						.addFields({
							name: '基本情報',
							value: `**名前**: ${user.globalName ? `${user.globalName}(${username})` : username}\n**ID**: \`${
								user.id
							}\`\n**アカウント作成日時**: ${time(user.createdAt, 'F')}\n**bot**: ${
								user.bot ? 'はい' : 'いいえ'
							}\n**system**: ${user.system ? 'はい' : 'いいえ'}\n**フラグ**: ${
								user.flags
									.toArray()
									.map((v) =>
										v
											.replaceAll('VerifiedDeveloper', '<:verified_bot_developer:1035780599404826645>')
											.replaceAll('PremiumEarlySupporter', '<:Discord_Early_Supporter:1027518349544005673>')
											.replaceAll('ActiveDeveloper', '<:ActiveDevloper:1082582737241776180>')
											.replaceAll('Staff', '<:Discord_Staff:1027518926957064212>')
											.replaceAll('Partner', '<:Partner_server:1028500801313833050>')
											.replaceAll('Hypesquad', '<:Discord_Hypesquad_Event:1027518774431191060>')
											.replaceAll('BugHunterLevel1', '<:Discord_Bug_Hunter:1027518144652255272>')
											.replaceAll('BugHunterLevel2', '<:Discord_Bug_Hunter:1027518144652255272>')
											.replaceAll('HypeSquadOnlineHouse1', '<:Discord_Hypesquad_Bravery:1027518564724379698>')
											.replaceAll('HypeSquadOnlineHouse2', '<:Discord_Hypesquad_Brilliance:1027518693128810496>')
											.replaceAll('HypeSquadOnlineHouse3', '<:Discord_Hypesquad_Balance:1027518440912728104>')
											.replaceAll('VerifiedBot', '<:verified_bot:1028499348792823818>')
											.replaceAll('CertifiedModerator', '<:DiscordCertifiedModerator:1082847714162786305>'),
									)
									.join(' ') || 'なし'
							}`,
							inline: true,
						})
						.setThumbnail(
							user.avatar
								? user.avatar.startsWith('a_')
									? user.extDefaultAvatarURL({ extension: 'gif' })
									: user.extDefaultAvatarURL({ extension: 'webp' })
								: user.extDefaultAvatarURL({ extension: 'webp' }),
						),
				],
			});
		}
	},
};
