import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { type ChatInputCommand } from '../../core/types/ChatInputCommand.js';
import { type CommandSetting } from '../../core/types/CommandSetting.js';

export default class Ping implements ChatInputCommand {
	public command: SlashCommandBuilder;
	public settings: CommandSetting;
	constructor() {
		this.command = new SlashCommandBuilder().setName('ping').setDescription('ping!!!');
		this.settings = { enable: true };
	}
	async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder().setTitle(':ping_pong: | Pong!').setDescription(`\`${interaction.client.ws.ping} ms\``),
			],
		});
	}
}
