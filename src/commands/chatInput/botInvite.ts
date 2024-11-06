import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	PermissionsBitField,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed } from '../../embeds/infosEmbed.js';
import { userFormat } from '../../utils/userFormat.js';

export default class BotInvite implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('bot_invite')
			.setDescription('指定したbotの招待リンクを生成します。')
			.addUserOption((input) => input.setName('bot').setDescription('bot').setRequired(false))
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	public getUrl(id: string, permission: 'admin' | 'custom' | 'none') {
		let permissionFlag: string = '0';

		if (permission === 'admin') {
			permissionFlag = PermissionsBitField.Flags.Administrator.toString();
		} else if (permission === 'custom') {
			permissionFlag = PermissionsBitField.All.toString();
		}

		const baseUrl = 'https://discord.com/api/oauth2/authorize';

		return `${baseUrl}?client_id=${id}&permissions=${permissionFlag}&scope=bot%20applications.commands`;
	}
	async run(interaction: ChatInputCommandInteraction) {
		let user = interaction.options.getUser('bot');
		if (!user) {
			user = interaction.client.user;
		}

		if (!user.bot) {
			return await interaction.reply({
				embeds: [failEmbed('指定したアカウントはユーザーです', 'これはBotではない')],
				flags: [MessageFlags.Ephemeral]
			});
		}
		const icon = user.displayAvatarURL({ extension: 'webp' });
		const my = new BotInvite();
		const admin = new ButtonBuilder()
			.setLabel('管理者権限')
			.setStyle(ButtonStyle.Link)
			.setURL(my.getUrl(user.id, 'admin'));
		const select = new ButtonBuilder()
			.setLabel('権限選択')
			.setStyle(ButtonStyle.Link)
			.setURL(my.getUrl(user.id, 'custom'));
		const none = new ButtonBuilder().setLabel('権限なし').setStyle(ButtonStyle.Link).setURL(my.getUrl(user.id, 'none'));

		return await interaction.reply({
			embeds: [infoEmbed('下のボタンから招待できます', `${userFormat(user)} を招待`).setThumbnail(icon)],
			components: [new ActionRowBuilder<ButtonBuilder>().addComponents(admin, select, none)]
		});
	}
}
