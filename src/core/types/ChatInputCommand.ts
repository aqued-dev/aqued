import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	type SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import type { CommandSetting } from './CommandSetting.js';

export interface ChatInputCommand {
	command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
	settings: CommandSetting;
	run(interaction: ChatInputCommandInteraction): Promise<unknown>;
}
