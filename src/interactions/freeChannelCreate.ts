import { BaseInteraction, ChannelType, Collection, PermissionFlagsBits } from 'discord.js';

export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith('freechannelcreatebtn_')) return;
	const userchannelnumber = interaction.customId.replace('freechannelcreatebtn_', '');
	const cooldowns = interaction.client.botData.cooldowns;
	if (userchannelnumber !== '0000') {
		const users = await interaction.client.botData.aquedFreeChannelUser.get(interaction.channelId);
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
	const categoryId = await interaction.client.botData.aquedFreeChannel.get(interaction.channelId);
	if (!categoryId)
		return await interaction.error('作成できませんでした。', 'チャンネル作成先カテゴリが設定されていません。', true);
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
			const users: string[] = (await interaction.client.botData.aquedFreeChannelUser.get(interaction.channelId)) || [];
			users.push(interaction.user.id);
			await interaction.client.botData.aquedFreeChannelUser.set(interaction.channelId, users);
			await interaction.ok('チャンネルを作成しました。', `<#${channel.id}>`, true);
			await channel.send({
				content: `<@!${interaction.user.id}>、チャンネルを作成しました。\n名前等自由に変更できます。`,
			});
		});
}
