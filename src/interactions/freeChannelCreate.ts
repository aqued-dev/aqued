import {
	ActionRowBuilder,
	BaseInteraction,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Collection,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (interaction.isButton()) {
		if (interaction.customId.startsWith('freechannelcreatebtn_')) {
			const userchannelnumber = interaction.customId.replace('freechannelcreatebtn_', '');
			const cooldowns = interaction.client.botData.cooldowns;
			const categoryId = await interaction.client.botData.aquedFreeChannel.get(interaction.channelId);

			if (userchannelnumber !== '0000') {
				const categoryId = await interaction.client.botData.aquedFreeChannel.get(interaction.channelId);
				const users = await interaction.client.botData.aquedFreeChannelUser.get(categoryId);
				if (users && Number(userchannelnumber) === users.filter((item) => item === interaction.user.id).length) {
					return await interaction.error(
						'作成できませんでした。',
						'これ以上チャンネルを作成できないよう管理者に設定されています。',
						true,
					);
				}
			}
			if (!cooldowns.has('freechannel')) cooldowns.set('freechannel', new Collection());
			const now = Date.now();
			const timestamps = cooldowns.get('freechannel');
			const cooldownAmount = 30_000;

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
			if (!categoryId)
				return await interaction.error(
					'作成できませんでした。',
					'チャンネル作成先カテゴリが設定されていません。',
					true,
				);
			const category = interaction.client.channels.cache.get(categoryId);
			if (!category)
				return await interaction.error('作成できませんでした。', 'チャンネル作成先カテゴリがありません。', true);
			if (category.type !== ChannelType.GuildCategory)
				return await interaction.error(
					'作成できませんでした。',
					'チャンネル作成先カテゴリがカテゴリではありません。',
					true,
				);

			category.children
				.create({
					name: `${
						interaction.user.discriminator === '0'
							? interaction.user.globalName || interaction.user.username
							: interaction.user.username
					}のチャンネル`,
					permissionOverwrites: [{ id: interaction.user.id, allow: PermissionFlagsBits.ManageChannels }],
					topic: `<@!${interaction.user.id}>のチャンネルです。`,
					type: ChannelType.GuildText,
				})
				.then(async (channel) => {
					const users: string[] = (await interaction.client.botData.aquedFreeChannelUser.get(categoryId)) || [];
					users.push(interaction.user.id);
					await interaction.client.botData.aquedFreeChannelUser.set(categoryId, users);
					await interaction.ok('チャンネルを作成しました。', `<#${channel.id}>`, true);
					await channel.send({
						content: `<@!${interaction.user.id}>、チャンネルを作成しました。\n名前等自由に変更できます。`,
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setLabel('チャンネルの編集')
									.setStyle(ButtonStyle.Success)
									.setCustomId('free_channel_edit_' + interaction.user.id),
							),
						],
					});
				});
		} else if (interaction.customId.startsWith('free_channel_edit_')) {
			const userId = interaction.customId.replace('free_channel_edit_', '');
			if (interaction.user.id !== userId)
				return await interaction.error(
					'あなたはチャンネルの編集ができません。',
					'あなたはこのチャンネルの作成者ではありません。',
					true,
				);
			if (interaction.channel.type !== ChannelType.GuildText) return;
			await interaction.showModal(
				new ModalBuilder()
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('name')
								.setLabel('チャンネル名')
								.setMaxLength(100)
								.setValue(interaction.channel.name)
								.setStyle(TextInputStyle.Short)
								.setRequired(false),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('topic')
								.setLabel('チャンネルトピック')
								.setMaxLength(1000)
								.setValue(interaction.channel.topic)
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(false),
						),
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId('slowmode')
								.setLabel('低速モードの秒数')
								.setMaxLength(5)
								.setValue(String(interaction.channel.rateLimitPerUser))
								.setStyle(TextInputStyle.Short)
								.setRequired(false),
						),
					)

					.setTitle('チャンネルの編集')
					.setCustomId('free_channel_edit_modal'),
			);
		}
	} else if (interaction.isModalSubmit() && interaction.customId === 'free_channel_edit_modal') {
		if (interaction.channel.type !== ChannelType.GuildText) return;
		const name = interaction.fields.getTextInputValue('name') || interaction.channel.name;
		const topic = interaction.fields.getTextInputValue('topic') || interaction.channel.topic;
		const slowmode =
			interaction.fields.getTextInputValue('slowmode') ||
			(interaction.channel.rateLimitPerUser && String(interaction.channel.rateLimitPerUser));

		if (Number.isNaN(Number(slowmode))) {
			return await interaction.error('チャンネルの編集に失敗', '低速モードの値が不正です。', true);
		} else if (Number(slowmode) < 0 || Number(slowmode) > 21_600) {
			return await interaction.error('チャンネルの編集に失敗', '低速モードの値が不正です。', true);
		}
		await interaction.channel.edit({ name, topic, rateLimitPerUser: Number(slowmode) });
		await interaction.ok('チャンネルの編集に成功', 'チャンネルの編集が成功しました。', true);
	}
}
