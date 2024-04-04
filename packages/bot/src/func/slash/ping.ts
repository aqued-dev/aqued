import { SlashCommandClass } from '../../lib/bot/index.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class Ping implements SlashCommandClass {
	command = new SlashCommandBuilder().setName('ping').setDescription('ping値を測定します(仮)');
	async run(interaction: ChatInputCommandInteraction) {
		
		await interaction.reply({ content: `${interaction.client.ws.ping} ms.`, ephemeral: true });
	}
}
