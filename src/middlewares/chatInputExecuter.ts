import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';
import { config } from '../config/config.js';
import { failEmbed } from '../embeds/infosEmbed.js';
import { translateChannelType } from '../utils/translateChannelType.js';
import { translatePermission } from '../utils/translatePermission.js';

export const chatInputExecuter = async (interaction: ChatInputCommandInteraction) => {
	const command = interaction.client.aqued.commands.chatInput.getCommand(interaction.commandName);

	if (command) {
		const setting = command.settings;
		if (!setting.enable) {
			return await interaction.reply({
				embeds: [failEmbed('このコマンドは無効です', '実行前エラー')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		if (setting.guildOnly && !interaction.inGuild()) {
			return await interaction.reply({
				embeds: [failEmbed('このコマンドはサーバー内でのみ使用できます', '実行前エラー')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		if (setting.adminOnly && !config.bot.admins.includes(interaction.user.id)) {
			return await interaction.reply({
				embeds: [failEmbed('このコマンドはAquedの管理者のみが使用できます', '実行前エラー')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		if (setting.modOnly && !config.bot.mods.includes(interaction.user.id)) {
			return await interaction.reply({
				embeds: [failEmbed('このコマンドはAquedのモデレーターのみが使用できます', '実行前エラー')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		if (setting.channelTypes && interaction.channel && !setting.channelTypes.includes(interaction.channel.type)) {
			return await interaction.reply({
				embeds: [
					failEmbed(
						`このコマンドは以下のチャンネルのみで使用できます\n${translateChannelType(
							setting.channelTypes.map((value) => BigInt(value))
						)
							.map((value) => `\`\`${value}\`\``)
							.join('\n')}`,
						'実行前エラー'
					)
				],
				flags: [MessageFlags.Ephemeral]
			});
		}
		if (
			interaction.member instanceof GuildMember &&
			interaction.channel &&
			!interaction.channel.isDMBased() &&
			setting.permissions
		) {
			const insufficient: bigint[] = [];
			for (const value of setting.permissions) {
				if (!interaction.member.permissionsIn(interaction.channel).has(value)) {
					insufficient.push(value);
				}
			}
			if (insufficient.length !== 0) {
				return await interaction.reply({
					embeds: [
						failEmbed(
							`このコマンドは実行者に以下の権限が必要です\n${translatePermission(insufficient)
								.map((value) => `\`\`${value}\`\``)
								.join('\n')}`,
							'実行前エラー'
						)
					],
					flags: [MessageFlags.Ephemeral]
				});
			}
		}
		if (interaction.guild && interaction.channel && !interaction.channel.isDMBased() && setting.permissions) {
			const bot = interaction.guild.members.cache.get(interaction.client.user.id);
			if (!bot) {
				return;
			}
			const insufficient: bigint[] = [];
			for (const value of setting.permissions) {
				if (!bot.permissionsIn(interaction.channel).has(value)) {
					insufficient.push(value);
				}
			}
			if (insufficient.length !== 0) {
				return await interaction.reply({
					embeds: [
						failEmbed(
							`このコマンドはBotに以下の権限が必要です\n${translatePermission(insufficient)
								.map((value) => `\`\`${value}\`\``)
								.join('\n')}`,
							'実行前エラー'
						)
					],
					flags: [MessageFlags.Ephemeral]
				});
			}
		}
		if (!interaction.client.aqued.cooldown.has(command.command.name)) {
			interaction.client.aqued.cooldown.set(command.command.name, new Map());
		}

		const now = Date.now();
		const timestamps = interaction.client.aqued.cooldown.get(command.command.name);
		const cooldownAmount = 3000;
		if (!timestamps) {
			return;
		}
		const userCooldown = timestamps.get(interaction.user.id);
		if (userCooldown) {
			const expirationTime = userCooldown + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return await interaction.reply({
					embeds: [failEmbed(`あと、\`${timeLeft.toFixed(1)}\`秒お待ちください`, 'クールダウン中')],
					flags: [MessageFlags.Ephemeral]
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		return await command.run(interaction);
	} else {
		return await interaction.reply({
			embeds: [failEmbed('このコマンドの処理が読み込まれていません', 'コマンドが存在しません')],
			flags: [MessageFlags.Ephemeral]
		});
	}
};
