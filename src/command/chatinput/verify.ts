import {
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ActionRowBuilder,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Colors,
} from 'discord.js';
export default {
	command: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('認証パネルを生成します。')
		.addStringOption((input) =>
			input
				.setName('type')
				.setDescription('認証の種類')
				.addChoices(
					{ name: '足し算認証', value: '足し算認証' },
					{ name: '引き算認証', value: '引き算認証' },
					{ name: '掛け算認証', value: '掛け算認証' },
					{ name: '割り算認証', value: '割り算認証' },
					{ name: '1クリック認証', value: '1クリック認証' },
					{ name: '乱数認証', value: '乱数認証' },
				)
				.setRequired(true),
		)
		.addRoleOption((input) =>
			input.setName('role').setDescription('認証が完了した時に付与するロール').setRequired(true),
		)
		.setGuildOnly(),
	ownersOnly: false,
	modOnly: false,
	permissions: false,

	async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getString('type')) {
			case '足し算認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('足し算認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_1').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			case '引き算認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('引き算認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_2').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			case '掛け算認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('掛け算認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_3').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			case '割り算認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('割り算認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_4').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			case '1クリック認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('1クリック認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_5').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			case '乱数認証': {
				const role = interaction.options.getRole('role');
				const message = await interaction.reply({
					fetchReply: true,
					embeds: [
						new EmbedBuilder()
							.setTitle('乱数認証')
							.setDescription(`下のボタンを押して、認証して下さい。\n付与されるロール: <@&${role.id}>`)
							.setColor(Colors.Blue),
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder().setCustomId('verify_button_6').setStyle(ButtonStyle.Success).setLabel(`認証`),
						),
					],
				});
				await interaction.client.botData.verifyPanel.set(message.id, role.id);
				break;
			}
			default: {
				break;
			}
		}
	},
};
