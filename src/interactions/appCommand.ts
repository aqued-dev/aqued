import {
	BaseInteraction,
	Collection,
	PermissionFlags,
	EmbedBuilder,
	SnowflakeUtil,
	Colors,
	ChannelType,
} from 'discord.js';
import { inspect } from 'node:util';
import { translatePermission } from '../utils/permission.js';
export default async function (interaction: BaseInteraction) {
	const { botData, channels, user } = interaction.client;
	if (interaction.isChatInputCommand()) {
		const command = botData.commands.chatInput.find((value) => value.name === interaction.commandName);
		if (!command) return await interaction.error('そのコマンドがありません', 'そのコマンドは存在しません。', true);
		const logChannel = channels.cache.get(botData.commandLogChannelId);
		if (!logChannel.isThread()) return;
		logChannel
			.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aqued Command Log')
						.setColor(Colors.Blue)
						.addFields(
							{ name: 'コマンド', value: interaction.commandName },
							{
								name: 'サブコマンド',
								value: interaction.options.getSubcommand(false) || 'なし',
							},
							{
								name: 'ユーザー',
								value:
									(interaction.user.discriminator === '0'
										? interaction.user.globalName
											? `${interaction.user.globalName} (@${interaction.user.username})`
											: ` @${interaction.user.username}`
										: `${interaction.user.globalName ?? interaction.user.username} (${interaction.user.username}#${interaction.user.discriminator})`) +
									`[id: ${interaction.user.id}]`,
							},
							{
								name: 'サーバー',
								value: `${interaction.guild ? interaction.guild.name : 'DM'}(${interaction.guildId || 'DM'})`,
							},
						),
				],
			})
			.then(
				async () =>
					await botData.commandExecutors.number.set(
						interaction.commandName,
						(await botData.commandExecutors.number.get(interaction.commandName))
							? Number(await botData.commandExecutors.number.get(interaction.commandName)) + 1
							: 1,
					),
			);
		if (command.data.ownersOnly && !botData.owners.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', '管理者専用コマンドです', true);
		if (command.data.modOnly && !botData.mods.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', 'モデレーター専用コマンドです', true);

		if (command.data.permissions) {
			const author = interaction.guild.members.cache.get(interaction.user.id);
			if (!author) return await interaction.error('このメンバーは存在しません。', 'このメンバーは存在しません。', true);
			const authorPerms = author.permissions;
			if (!authorPerms || !command.data.permissions.every((permission) => authorPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、あなたに`' +
						translatePermission(permission).join(', ') +
						'`の権限が必要です。',
					true,
				);
			}
			const botPerms = interaction.channel.permissionsFor(interaction.guild.members.cache.get(user.id));
			if (!botPerms || !command.data.permissions.every((permission) => botPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、Botに`' + translatePermission(permission).join(', ') + '`の権限が必要です。',
					true,
				);
			}
		}
		if (!botData.cooldowns.has(command.name)) botData.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = botData.cooldowns.get(command.name);
		const cooldownAmount = 3000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return await interaction.error(
					'クールダウン',
					`クールダウン中です。あと、\`${timeLeft.toFixed(1)}\`秒お待ちください。`,
					true,
				);
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		try {
			command.data.execute(interaction).catch(async (error) => {
				console.error(error);
				const errorId = SnowflakeUtil.generate();
				botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
				await interaction.error(
					'エラーが発生しました。',
					`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
					true,
				);
				const Errorchannel = channels.cache.get(botData.errorChannelId);
				if (Errorchannel.type === ChannelType.GuildText)
					Errorchannel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(':x: エラーが発生しました。')
								.setDescription(`Id: ${errorId.toString()}`)
								.setColor(Colors.Red),
						],
					});
			});
		} catch (error) {
			console.error(error);
			const errorId = SnowflakeUtil.generate();

			botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
			await interaction.error(
				'エラーが発生しました。',
				`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
				true,
			);
			const Errorchannel = channels.cache.get(botData.errorChannelId);
			if (Errorchannel.type === ChannelType.GuildText)
				Errorchannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(':x: エラーが発生しました。')
							.setDescription(`Id: ${errorId.toString()}`)
							.setColor(Colors.Red),
					],
				});
		}
	} else if (interaction.isUserContextMenuCommand()) {
		const command = botData.commands.userCotextMenu.find((value) => value.name === interaction.commandName);

		if (!command) return await interaction.error('そのコマンドがありません', 'そのコマンドは存在しません。', true);
		const logChannel = channels.cache.get(botData.commandLogChannelId);
		if (!logChannel.isThread()) return;
		logChannel
			.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aqued Command Log')
						.setColor(Colors.Blue)
						.addFields(
							{ name: 'コマンド', value: interaction.commandName },
							{
								name: 'ユーザー',
								value:
									(interaction.user.discriminator === '0'
										? interaction.user.globalName
											? `${interaction.user.globalName} (@${interaction.user.username})`
											: ` @${interaction.user.username}`
										: `${interaction.user.globalName ?? interaction.user.username} (${interaction.user.username}#${interaction.user.discriminator})`) +
									`[id: ${interaction.user.id}]`,
							},
							{
								name: 'サーバー',
								value: `${interaction.guild ? interaction.guild.name : 'DM'}(${interaction.guildId || 'DM'})`,
							},
						),
				],
			})
			.then(
				async () =>
					await botData.commandExecutors.number.set(
						interaction.commandName,
						(await botData.commandExecutors.number.get(interaction.commandName))
							? Number(await botData.commandExecutors.number.get(interaction.commandName)) + 1
							: 1,
					),
			);
		if (command.data.ownersOnly && !botData.owners.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', '管理者専用コマンドです', true);
		if (command.data.modOnly && !botData.mods.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', 'モデレーター専用コマンドです', true);

		if (command.data.permissions) {
			const author = interaction.guild.members.cache.get(interaction.user.id);
			if (!author) return await interaction.error('このメンバーは存在しません。', 'このメンバーは存在しません。', true);
			const authorPerms = author.permissions;
			if (!authorPerms || !command.data.permissions.every((permission) => authorPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、あなたに`' +
						translatePermission(permission).join(', ') +
						'`の権限が必要です。',
					true,
				);
			}
			const botPerms = interaction.channel.permissionsFor(interaction.guild.members.cache.get(user.id));
			if (!botPerms || !command.data.permissions.every((permission) => botPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、Botに`' + translatePermission(permission).join(', ') + '`の権限が必要です。',
					true,
				);
			}
		}
		if (!botData.cooldowns.has(command.name)) botData.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = botData.cooldowns.get(command.name);
		const cooldownAmount = 3000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return await interaction.error(
					'クールダウン',
					`クールダウン中です。あと、\`${timeLeft.toFixed(1)}\`秒お待ちください。`,
					true,
				);
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		try {
			command.data.execute(interaction).catch(async (error) => {
				console.error(error);
				const errorId = SnowflakeUtil.generate();
				botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
				await interaction.error(
					'エラーが発生しました。',
					`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
					true,
				);
				const Errorchannel = channels.cache.get(botData.errorChannelId);
				if (Errorchannel.type === ChannelType.GuildText)
					Errorchannel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(':x: エラーが発生しました。')
								.setDescription(`Id: ${errorId.toString()}`)
								.setColor(Colors.Red),
						],
					});
			});
		} catch (error) {
			console.error(error);
			const errorId = SnowflakeUtil.generate();

			botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
			await interaction.error(
				'エラーが発生しました。',
				`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
				true,
			);
			const Errorchannel = channels.cache.get(botData.errorChannelId);
			if (Errorchannel.type === ChannelType.GuildText)
				Errorchannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(':x: エラーが発生しました。')
							.setDescription(`Id: ${errorId.toString()}`)
							.setColor(Colors.Red),
					],
				});
		}
	} else if (interaction.isMessageContextMenuCommand()) {
		const command = botData.commands.messageCotextMenu.find((value) => value.name === interaction.commandName);

		if (!command) return await interaction.error('そのコマンドがありません', 'そのコマンドは存在しません。', true);
		const logChannel = channels.cache.get(botData.commandLogChannelId);
		if (!logChannel.isThread()) return;
		logChannel
			.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('Aqued Command Log')
						.setColor(Colors.Blue)
						.addFields(
							{ name: 'コマンド', value: interaction.commandName },
							{
								name: 'ユーザー',
								value:
									(interaction.user.discriminator === '0'
										? interaction.user.globalName
											? `${interaction.user.globalName} (@${interaction.user.username})`
											: ` @${interaction.user.username}`
										: `${interaction.user.globalName ?? interaction.user.username} (${interaction.user.username}#${interaction.user.discriminator})`) +
									`[id: ${interaction.user.id}]`,
							},
							{
								name: 'サーバー',
								value: `${interaction.guild ? interaction.guild.name : 'DM'}(${interaction.guildId || 'DM'})`,
							},
						),
				],
			})
			.then(
				async () =>
					await botData.commandExecutors.number.set(
						interaction.commandName,
						(await botData.commandExecutors.number.get(interaction.commandName))
							? Number(await botData.commandExecutors.number.get(interaction.commandName)) + 1
							: 1,
					),
			);
		if (command.data.ownersOnly && !botData.owners.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', '管理者専用コマンドです', true);
		if (command.data.modOnly && !botData.mods.includes(interaction.user.id))
			return await interaction.error('あなたはこのコマンドを利用できません', 'モデレーター専用コマンドです', true);

		if (command.data.permissions) {
			const author = interaction.guild.members.cache.get(interaction.user.id);
			if (!author) return await interaction.error('このメンバーは存在しません。', 'このメンバーは存在しません。', true);
			const authorPerms = author.permissions;
			if (!authorPerms || !command.data.permissions.every((permission) => authorPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、あなたに`' +
						translatePermission(permission).join(', ') +
						'`の権限が必要です。',
					true,
				);
			}
			const botPerms = interaction.channel.permissionsFor(interaction.guild.members.cache.get(user.id));
			if (!botPerms || !command.data.permissions.every((permission) => botPerms.has(permission))) {
				const permission: PermissionFlags[] = command.data.permissions;
				return await interaction.error(
					'権限不足',
					'このコマンドを実行するためには、Botに`' + translatePermission(permission).join(', ') + '`の権限が必要です。',
					true,
				);
			}
		}
		if (!botData.cooldowns.has(command.name)) botData.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = botData.cooldowns.get(command.name);
		const cooldownAmount = 3000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return await interaction.error(
					'クールダウン',
					`クールダウン中です。あと、\`${timeLeft.toFixed(1)}\`秒お待ちください。`,
					true,
				);
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		try {
			command.data.execute(interaction).catch(async (error) => {
				console.error(error);
				const errorId = SnowflakeUtil.generate();
				botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
				await interaction.error(
					'エラーが発生しました。',
					`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
					true,
				);
				const Errorchannel = channels.cache.get(botData.errorChannelId);
				if (Errorchannel.type === ChannelType.GuildText)
					Errorchannel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle(':x: エラーが発生しました。')
								.setDescription(`Id: ${errorId.toString()}`)
								.setColor(Colors.Red),
						],
					});
			});
		} catch (error) {
			console.error(error);
			const errorId = SnowflakeUtil.generate();

			botData.errors.set(errorId.toString(), inspect(error).slice(0, 1800));
			await interaction.error(
				'エラーが発生しました。',
				`以下のIDを控え、サポートサーバーでお問い合わせください。\nID: \`${errorId.toString()}\``,
				true,
			);
			const Errorchannel = channels.cache.get(botData.errorChannelId);
			if (Errorchannel.type === ChannelType.GuildText)
				Errorchannel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle(':x: エラーが発生しました。')
							.setDescription(`Id: ${errorId.toString()}`)
							.setColor(Colors.Red),
					],
				});
		}
	}
}
