import { BaseInteraction, Events, GuildMember } from 'discord.js';
import { oldButtonPaginationDisable } from '../components/button/pagenation.js';
import { config } from '../config/config.js';
import type { EventListener } from '../core/types/EventListener.js';

export default class InteractionCommandHandler implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}

	async execute(interaction: BaseInteraction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.aqued.commands.chatInput.getCommand(interaction.commandName);

			if (command) {
				const setting = command.settings;
				if (!setting.enable) {
					return await interaction.reply({
						content: 'このコマンドは無効です！',
						ephemeral: true,
					});
				}
				if (setting.guildOnly && !interaction.inGuild()) {
					return await interaction.reply({
						content: 'このコマンドはサーバー内でのみ使用できます！',
						ephemeral: true,
					});
				}
				if (setting.adminOnly && !config.bot.admins.includes(interaction.user.id))
					return await interaction.reply({
						content: 'このコマンドはAquedの管理者のみ使用できます！',
						ephemeral: true,
					});
				if (setting.modOnly && !config.bot.mods.includes(interaction.user.id))
					return await interaction.reply({
						content: 'このコマンドはAquedのモデレーターのみ使用できます！',
						ephemeral: true,
					});
				if (setting.channelTypes && interaction.channel && !setting.channelTypes.includes(interaction.channel.type)) {
					return await interaction.reply({
						content: 'このコマンドは以下のチャンネルのみで使用いただけます！\n' + setting.channelTypes.join('\n'),
						ephemeral: true,
					});
				}
				if (
					interaction.member instanceof GuildMember &&
					interaction.channel &&
					!interaction.channel.isDMBased() &&
					setting.permissions
				) {
					for (const value of setting.permissions) {
						if (!interaction.member.permissionsIn(interaction.channel).has(value)) {
							if (interaction.replied)
								await interaction.followUp({
									content: 'このコマンドを実行する権限がありません: ' + value.toString(),
									ephemeral: true,
								});
							else
								await interaction.reply({
									content: 'このコマンドを実行する権限がありません: ' + value.toString(),
									ephemeral: true,
								});
						}
					}
				}
				if (!interaction.client.aqued.cooldown.has(command.command.name))
					interaction.client.aqued.cooldown.set(command.command.name, new Map());

				const now = Date.now();
				const timestamps = interaction.client.aqued.cooldown.get(command.command.name);
				const cooldownAmount = 3000;
				if (!timestamps) return;
				const userCooldown = timestamps.get(interaction.user.id);
				if (userCooldown) {
					const expirationTime = userCooldown + cooldownAmount;

					if (now < expirationTime) {
						const timeLeft = (expirationTime - now) / 1000;
						return await interaction.reply({
							content: `クールダウン中です。あと、\`${timeLeft.toFixed(1)}\`秒お待ちください。`,
							ephemeral: true,
						});
					}
				}

				timestamps.set(interaction.user.id, now);
				setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

				return await command.run(interaction);
			} else {
				return await interaction.reply({
					content:
						'コマンドが存在しません...\n恐らくコマンドがまだ読み込まれていないのでしょう。\nこれは非常に稀です！おめでとうございます',
					ephemeral: true,
				});
			}
		} else if (interaction.isButton()) {
			return await oldButtonPaginationDisable(interaction);
		} else {
			return;
		}
	}
}
