import {
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction
} from 'discord.js';
import type { CommandSetting } from './CommandSetting.js';

export interface MessageContextMenuCommand {
	command: ContextMenuCommandBuilder;
	settings: CommandSetting;
	run(interaction: MessageContextMenuCommandInteraction): Promise<unknown>;
}
export interface UserContextMenuCommand {
	command: ContextMenuCommandBuilder;
	settings: CommandSetting;
	run(interaction: UserContextMenuCommandInteraction): Promise<unknown>;
}
