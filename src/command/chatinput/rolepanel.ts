import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	SnowflakeUtil,
	PermissionFlagsBits,
} from 'discord.js';

export default {
	command: new SlashCommandBuilder()
		.setName('rolepanel')
		.setDescription('ロールパネルを生成します。')
		.addRoleOption((input) => input.setName('role1').setDescription('ロール1').setRequired(true))
		.addRoleOption((input) => input.setName('role2').setDescription('ロール2').setRequired(false))
		.addRoleOption((input) => input.setName('role3').setDescription('ロール3').setRequired(false))
		.addRoleOption((input) => input.setName('role4').setDescription('ロール4').setRequired(false))
		.addRoleOption((input) => input.setName('role5').setDescription('ロール5').setRequired(false))
		.addRoleOption((input) => input.setName('role6').setDescription('ロール6').setRequired(false))
		.addRoleOption((input) => input.setName('role7').setDescription('ロール7').setRequired(false))
		.addRoleOption((input) => input.setName('role8').setDescription('ロール8').setRequired(false))
		.addRoleOption((input) => input.setName('role9').setDescription('ロール9').setRequired(false))
		.addRoleOption((input) => input.setName('role10').setDescription('ロール10').setRequired(false))
		.setGuildOnly(),
	ownersOnly: false,
	modOnly: false,
	permissions: [PermissionFlagsBits.ManageRoles],
	async execute(interaction: ChatInputCommandInteraction) {
		const id = SnowflakeUtil.generate();
		const roles = [];

		for (let index = 1; index <= 10; index++) {
			const rawRole = interaction.options.getRole(`role${index}`);
			const role = interaction.guild.roles.cache.get(rawRole ? rawRole.id : '');
			const member = interaction.guild.members.cache.get(interaction.user.id);
			if (role && member && member.roles.highest.comparePositionTo(role) <= 0)
				return await interaction.error(
					'実行者のロールよりも上位のロールを指定しています',
					'指定したロールはあなたが持っているロールよりも上です。',
					true,
				);

			roles.push(rawRole ? { id: rawRole.id, name: rawRole.name } : undefined);
		}

		await interaction.client.botData.rolePanel.set(id.toString(), roles);
		await interaction.showModal(
			new ModalBuilder()
				.setTitle('ロールパネル')
				.setCustomId('role_panel_modal_' + id.toString())
				.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('title')
							.setLabel('タイトル')
							.setMaxLength(100)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder('デフォルト：ロールパネル')
							.setRequired(false),
					),
					new ActionRowBuilder<TextInputBuilder>().addComponents(
						new TextInputBuilder()
							.setCustomId('description')
							.setLabel('メッセージ')
							.setMaxLength(100)
							.setStyle(TextInputStyle.Short)
							.setPlaceholder('デフォルト：以下のセレクトメニューで、ロールを取得できます。')
							.setRequired(false),
					),
				),
		);
	},
};
