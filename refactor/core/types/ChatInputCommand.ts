import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ChatInputCommand {
	command: SlashCommandBuilder;
	run(interaction: ChatInputCommandInteraction): Promise<unknown>;
}
