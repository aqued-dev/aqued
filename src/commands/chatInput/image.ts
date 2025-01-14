import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, successEmbed } from '../../embeds/infosEmbed.js';

export default class Image implements ChatInputCommand {
	public command: SlashCommandSubcommandsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('image')
			.setDescription('画像を表示する系コマンド')
			.addSubcommand((input) => input.setName('cat').setDescription('猫の画像を表示します'))
			.addSubcommand((input) => input.setName('dog').setDescription('犬の画像を表示します'))
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const name = interaction.options.getSubcommand();
		if (name === 'cat') {
			return fetch('https://api.thecatapi.com/v1/images/search').then(async (response) => {
				if (!response.ok) {
					return await interaction.editReply({
						embeds: [failEmbed('画像を取得できませんでした', '🐈猫')]
					});
				}
				const data = (await response.json()) as { url: string }[];
				if (!data[0]) {
					return await interaction.editReply({
						embeds: [failEmbed('画像を取得できませんでした', '🐈猫')]
					});
				}
				return await interaction.editReply({
					embeds: [successEmbed(undefined, '🐈猫').setImage(data[0].url)]
				});
			});
		} else {
			return fetch('https://dog.ceo/api/breeds/image/random').then(async (response) => {
				if (!response.ok) {
					return await interaction.editReply({
						embeds: [failEmbed('画像を取得できませんでした', '🐶犬')]
					});
				}
				const data = (await response.json()) as { message: string };
				if (!data.message) {
					return await interaction.editReply({
						embeds: [failEmbed('画像を取得できませんでした', '🐶犬')]
					});
				}
				return await interaction.editReply({
					embeds: [successEmbed(undefined, '🐶犬').setImage(data.message)]
				});
			});
		}
	}
}
