import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { successEmbed } from '../../embeds/infosEmbed.js';

export default class Gosen implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('5000')
			.setDescription('5000兆円欲しい!!を生成します。')
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild])
			.addStringOption((input) => input.setName('top').setDescription('上部文字列').setRequired(true))
			.addStringOption((input) => input.setName('bottom').setDescription('下部文字列').setRequired(true))
			.addStringOption((input) =>
				input
					.setName('type')
					.setDescription('画像の拡張子')
					.setChoices([
						{ name: 'png', value: 'png' },
						{ name: 'jpeg', value: 'jpg' },
						{ name: 'webp', value: 'webp' }
					])
					.setRequired(true)
			)
			.addStringOption((input) =>
				input
					.setName('quality')
					.setDescription('画像の画質')
					.setChoices([
						{ name: '低', value: '30' },
						{ name: '中', value: '70' },
						{ name: '高', value: '100' }
					])
					.setRequired(true)
			)
			.addStringOption((input) =>
				input
					.setName('hoshii')
					.setDescription('下部文字列を「欲しい！」に固定する')
					.setChoices([
						{ name: '固定する', value: 'true' },
						{ name: '固定しない', value: 'false' }
					])
					.setRequired(true)
			)
			.addStringOption((input) =>
				input
					.setName('noalpha')
					.setDescription('背景色を白にする')
					.setChoices([
						{ name: '白にする', value: 'true' },
						{ name: '白にしない', value: 'false' }
					])
					.setRequired(true)
			)
			.addStringOption((input) =>
				input
					.setName('rainbow')
					.setDescription('虹色にする')
					.setChoices([
						{ name: '虹色にする', value: 'true' },
						{ name: '虹色にしない', value: 'false' }
					])
					.setRequired(true)
			);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		const url = new URL('https://gsapi.cbrx.io/image');
		url.searchParams.set('top', interaction.options.getString('top') ?? '');
		url.searchParams.set('bottom', interaction.options.getString('bottom') ?? '');
		url.searchParams.set('type', interaction.options.getString('type') ?? '');
		url.searchParams.set('quality', interaction.options.getString('quality') ?? '');
		url.searchParams.set('hoshii', interaction.options.getString('hoshii') ?? '');
		url.searchParams.set('noalpha', interaction.options.getString('noalpha') ?? '');
		url.searchParams.set('rainbow', interaction.options.getString('rainbow') ?? '');
		await interaction.reply({
			embeds: [successEmbed(undefined, undefined, undefined, 'Powered by 5000choyen-api').setImage(url.toString())]
		});
	}
}
