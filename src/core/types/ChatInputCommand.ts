import { ChatInputCommandInteraction, SlashCommandBuilder, type SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { CommandSetting } from './CommandSetting.js';

export interface ChatInputCommand {
	command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
	settings: CommandSetting;
	run(interaction: ChatInputCommandInteraction): Promise<unknown>;
}
