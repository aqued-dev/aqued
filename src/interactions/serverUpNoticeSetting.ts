import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isStringSelectMenu()) {
		switch (interaction.customId) {
			case 'server_up_notice_yn': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				switch (interaction.message.embeds[0].fields[0].name) {
					case 'ディス速': {
						await interaction.client.botData.guildUpNotice.dissoku.set(
							interaction.guildId,
							interaction.values[0] === 'y' ? true : false,
						);
						await interaction.ok(
							'通知の設定をしました',
							interaction.values[0] === 'y'
								? 'ディス速の通知を有効に設定しました。'
								: 'ディス速の通知を無効に設定しました。',
							true,
						);
						await interaction.message.edit({
							embeds: [
								new EmbedBuilder()
									.setTitle('サーバーUP通知設定')
									.setDescription('下のボタンを押してそのbotのサーバーUPの通知設定ができます')
									.addFields({
										name: 'ディス速',
										value: `${
											(await interaction.client.botData.guildUpNotice.dissoku.get(interaction.guildId))
												? '有効'
												: '無効'
										}`,
									})
									.setColor(Colors.Blue),
							],
							components: [
								new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
									new StringSelectMenuBuilder()
										.setPlaceholder('有効/無効')
										.setCustomId('server_up_notice_yn')
										.setMaxValues(1)
										.addOptions({ label: '有効', value: 'y' }, { label: '無効', value: 'n' }),
								),
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setLabel('ディス速')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_1'),
									new ButtonBuilder()
										.setLabel('DISBOARD')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_2'),
								),
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setLabel('通知するロールの選択')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_role_select_button'),
								),
							],
						});
						break;
					}
					case 'DISBOARD': {
						await interaction.client.botData.guildUpNotice.disboard.set(
							interaction.guildId,
							interaction.values[0] === 'y' ? true : false,
						);
						await interaction.ok(
							'通知の設定をしました',
							interaction.values[0] === 'y'
								? 'DISBOARDの通知を有効に設定しました。'
								: 'DISBOARDの通知を無効に設定しました。',
							true,
						);
						await interaction.message.edit({
							embeds: [
								new EmbedBuilder()
									.setTitle('サーバーUP通知設定')
									.setDescription('下のボタンを押してそのbotのサーバーUPの通知設定ができます')
									.addFields({
										name: 'DISBOARD',
										value: `${
											(await interaction.client.botData.guildUpNotice.disboard.get(interaction.guildId))
												? '有効'
												: '無効'
										}`,
									})
									.setColor(Colors.Blue),
							],
							components: [
								new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
									new StringSelectMenuBuilder()
										.setPlaceholder('有効/無効')
										.setCustomId('server_up_notice_yn')
										.setMaxValues(1)
										.addOptions({ label: '有効', value: 'y' }, { label: '無効', value: 'n' }),
								),
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setLabel('ディス速')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_1'),
									new ButtonBuilder()
										.setLabel('DISBOARD')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_2'),
								),
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setLabel('通知するロールの選択')
										.setStyle(ButtonStyle.Primary)
										.setCustomId('server_up_notice_role_select_button'),
								),
							],
						});
						break;
					}
				}
				break;
			}
		}
	}
	if (interaction.isRoleSelectMenu()) {
		switch (interaction.customId) {
			case 'server_up_notice_role': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				switch (interaction.message.embeds[0].title) {
					case 'ディス速': {
						await interaction.client.botData.guildUpNotice.dissoku.set(
							interaction.guildId + '_role',
							interaction.values[0],
						);
						await interaction.ok('設定しました。', 'ロールを設定しました。', true);
						break;
					}
					case 'DISBOARD': {
						await interaction.client.botData.guildUpNotice.disboard.set(
							interaction.guildId + '_role',
							interaction.values[0],
						);
						await interaction.ok('設定しました。', 'ロールを設定しました。', true);
						break;
					}
				}
				break;
			}
		}
	}
	if (interaction.isButton()) {
		switch (interaction.customId) {
			case 'server_up_notice_1': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				await interaction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('サーバーUP通知設定')
							.setDescription('下のボタンを押してそのbotのサーバーUPの通知設定ができます')
							.addFields({
								name: 'ディス速',
								value: `${
									(await interaction.client.botData.guildUpNotice.dissoku.get(interaction.guildId)) ? '有効' : '無効'
								}`,
							})
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							new StringSelectMenuBuilder()
								.setPlaceholder('有効/無効')
								.setCustomId('server_up_notice_yn')
								.setMaxValues(1)
								.addOptions({ label: '有効', value: 'y' }, { label: '無効', value: 'n' }),
						),
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setLabel('ディス速').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_1'),
							new ButtonBuilder().setLabel('DISBOARD').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_2'),
						),
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setLabel('通知するロールの選択')
								.setStyle(ButtonStyle.Primary)
								.setCustomId('server_up_notice_role_select_button'),
						),
					],
				});
				break;
			}

			case 'server_up_notice_2': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				await interaction.update({
					embeds: [
						new EmbedBuilder()
							.setTitle('サーバーUP通知設定')
							.setDescription('下のボタンを押してそのbotのサーバーUPの通知設定ができます')
							.addFields({
								name: 'DISBOARD',
								value: `${
									(await interaction.client.botData.guildUpNotice.disboard.get(interaction.guildId)) ? '有効' : '無効'
								}`,
							})
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							new StringSelectMenuBuilder()
								.setPlaceholder('有効/無効')
								.setCustomId('server_up_notice_yn')
								.setMaxValues(1)
								.addOptions({ label: '有効', value: 'y' }, { label: '無効', value: 'n' }),
						),
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setLabel('ディス速').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_1'),
							new ButtonBuilder().setLabel('DISBOARD').setStyle(ButtonStyle.Primary).setCustomId('server_up_notice_2'),
						),
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setLabel('通知するロールの選択')
								.setStyle(ButtonStyle.Primary)
								.setCustomId('server_up_notice_role_select_button'),
						),
					],
				});
				break;
			}

			case 'server_up_notice_role_select_button': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				switch (interaction.message.embeds[0].fields[0].name) {
					case 'ディス速': {
						const role = await interaction.client.botData.guildUpNotice.dissoku.get(interaction.guildId + '_role');
						const message = await (role
							? interaction.reply({
									fetchReply: true,
									content: 'ロール選択または解除してください。',
									ephemeral: true,
									components: [
										new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
											new RoleSelectMenuBuilder()
												.setPlaceholder('ロール選択...')
												.setCustomId('server_up_notice_role')
												.setMaxValues(1),
										),
										new ActionRowBuilder<ButtonBuilder>().addComponents(
											new ButtonBuilder()
												.setLabel('ロール通知をオフにする')
												.setStyle(ButtonStyle.Danger)
												.setCustomId('server_up_notice_role_delete_button'),
										),
									],
									embeds: [new EmbedBuilder().setTitle('ディス速').setColor(Colors.Blue)],
							  })
							: interaction.reply({
									fetchReply: true,
									content: 'ロール選択または解除してください。',
									ephemeral: true,
									components: [
										new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
											new RoleSelectMenuBuilder()
												.setPlaceholder('ロール選択...')
												.setCustomId('server_up_notice_role')
												.setMaxValues(1),
										),
									],
									embeds: [new EmbedBuilder().setTitle('ディス速').setColor(Colors.Blue)],
							  }));
						await interaction.client.botData.commandExecutors.serverUpNotice.set(message.id, interaction.user.id);

						break;
					}
					case 'DISBOARD': {
						const role = await interaction.client.botData.guildUpNotice.disboard.get(interaction.guildId + '_role');
						const message = await (role
							? interaction.reply({
									fetchReply: true,
									content: 'ロール選択または解除してください。',
									ephemeral: true,
									components: [
										new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
											new RoleSelectMenuBuilder()
												.setPlaceholder('ロール選択...')
												.setCustomId('server_up_notice_role')
												.setMaxValues(1),
										),
										new ActionRowBuilder<ButtonBuilder>().addComponents(
											new ButtonBuilder()
												.setLabel('ロール通知をオフにする')
												.setStyle(ButtonStyle.Danger)
												.setCustomId('server_up_notice_role_delete_button'),
										),
									],
									embeds: [new EmbedBuilder().setTitle('DISBOARD').setColor(Colors.Blue)],
							  })
							: interaction.reply({
									fetchReply: true,
									content: 'ロール選択または解除してください。',
									ephemeral: true,
									components: [
										new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
											new RoleSelectMenuBuilder()
												.setPlaceholder('ロール選択...')
												.setCustomId('server_up_notice_role')
												.setMaxValues(1),
										),
									],
									embeds: [new EmbedBuilder().setTitle('DISBOARD').setColor(Colors.Blue)],
							  }));
						await interaction.client.botData.commandExecutors.serverUpNotice.set(message.id, interaction.user.id);

						break;
					}
				}
				break;
			}
			case 'server_up_notice_role_delete_button': {
				if (
					(await interaction.client.botData.commandExecutors.serverUpNotice.get(interaction.message.id)) !==
					interaction.user.id
				)
					return await interaction.error(
						'あなたはコマンドの実行者ではありません。',
						'このコマンドはコマンド実行者以外の操作は許可されていません。',
						true,
					);
				switch (interaction.message.embeds[0].title) {
					case 'ディス速': {
						await interaction.client.botData.guildUpNotice.dissoku.delete(interaction.guildId + '_role');
						await interaction.ok('設定しました。', 'ロール通知をオフにしました。', true);
						break;
					}
					case 'DISBOARD': {
						await interaction.client.botData.guildUpNotice.disboard.delete(interaction.guildId + '_role');
						await interaction.ok('設定しました。', 'ロール通知をオフにしました。', true);
						break;
					}
				}
				break;
			}
		}
	}
}
