import {
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import { buttonPagination } from '../../components/button/pagenation.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';
import { failEmbed, infoEmbed } from '../../embeds/infosEmbed.js';
import BotInvite from './botInvite.js';

export default class Help implements ChatInputCommand {
	public command: SlashCommandOptionsOnlyBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder()
			.setName('help')
			.setDescription('コマンド一覧を表示します(もしくは、指定したコマンドの情報を表示します)')
			.addStringOption((input) =>
				input.setName('name').setDescription('コマンド名').setAutocomplete(true).setRequired(false)
			)
			.setIntegrationTypes([ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall])
			.setContexts([InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild]);
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		const commands = Array.from(interaction.client.aqued.commands.commands.values()).map((item) => item.command);
		const commandName = interaction.options.getString('name');
		if (commandName) {
			const command = commands.filter((value) => value.name === commandName);
			if (!command[0]) {
				return await interaction.reply({
					embeds: [failEmbed('指定したコマンドは存在しません')]
				});
			} else {
				const name = command[0].name;
				const description = (command[0] as SlashCommandBuilder).description ?? '説明はありません';
				return await interaction.reply({
					embeds: [infoEmbed(description, name)]
				});
			}
		}
		const botInvite = new BotInvite();
		const supportServer = '[`サポートサーバー`](https://discord.gg/rE75MJswYw)\n';
		const appAdd = `[\`アプリの追加\`](${botInvite.getUrl(interaction.client.user.id, 'custom')})\n`;
		const site = '[`公式サイト`](https://aqued.gx1285.com/)\n';
		const baseEmbed = infoEmbed(supportServer + appAdd + site);
		const embeds = [baseEmbed];
		const pageSize = 5;
		const pageCount = Math.ceil(commands.length / pageSize);

		for (let pageNumber = 0; pageNumber < pageCount; pageNumber++) {
			const startIndex = pageNumber * pageSize;
			const endIndex = Math.min(startIndex + pageSize, commands.length);
			const fields = commands.slice(startIndex, endIndex).map((command) => {
				const name = command.name;
				const description = (command as SlashCommandBuilder).description ?? '説明はありません';
				return {
					name: name,
					description: description
				};
			});
			const list = fields.map((value) => `### ${value.name}\n${value.description}`).join('\n');
			const embed = infoEmbed(list);
			embeds.push(embed);
		}
		return await buttonPagination(embeds, interaction);
	}
}
