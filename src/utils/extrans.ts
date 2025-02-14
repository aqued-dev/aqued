import {
	Collection,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	REST,
	RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { SlashCommandBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';

import { MongoDB } from './MongoDB.js';
import './userExtrans.js';
import './interactionExtrans.js';
declare module 'discord.js' {
	interface Client {
		botData: {
			commands: {
				chatInput: Array<{ name: string; data: any }>;
				userCotextMenu: Array<{ name: string; data: any }>;
				messageCotextMenu: Array<{ name: string; data: any }>;
			};
			load: {
				chatinput: boolean;
				messagecotextmenu: boolean;
				usercotextmenu: boolean;
			};
			aquedFreeChannel: MongoDB;
			aquedFreeChannelUser: MongoDB;
			rolePanel: MongoDB;
			rolePanelId: MongoDB;
			commandExecutors: { serverUpNotice: MongoDB; number: MongoDB; users: MongoDB };
			interactionFiles: any[];
			messageFiles: any[];
			owners: string[];
			gbans: MongoDB;
			messageExpansion: MongoDB;
			sgcJsonChannelId: string;
			afk: {
				afk: MongoDB;
				mention: MongoDB;
			};
			guildUpNotice: { dissoku: MongoDB; disboard: MongoDB };
			mods: string[];
			cooldowns?: Collection<string, any>;
			reboot: boolean;
			errors: MongoDB;
			artifacter: MongoDB;
			forcePin: MongoDB;
			infos: MongoDB;
			errorChannelId: string;
			botLogChannelId: string;
			verifyPanel: MongoDB;
			globalChat: { register: MongoDB; messages: MongoDB; blocks: MongoDB };
			superGlobalChat: { register: MongoDB; messages: MongoDB; replyMessages: MongoDB };
			aquedAutoNews: MongoDB;
			commandLogChannelId: string;
			commandDatas: Array<
				RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody
			>;
			rest: REST;
			clientId: string;
		};
	}
}
declare module '@discordjs/builders' {
	interface SlashCommandBuilder {
		setGuildOnly(): SlashCommandBuilder;
	}
	interface ContextMenuCommandBuilder {
		setGuildOnly(): ContextMenuCommandBuilder;
	}
}
function setGuildOnly() {
	return this.setDMPermission(false);
}
export enum ApplicationIntegrationType {
	GuildInstall = 0,
	UserInstall = 1,
}
export enum InteractionContextType {
	Guild = 0,
	BotDM = 1,
	PrivateChannel = 2,
}
SlashCommandBuilder.prototype.setGuildOnly = setGuildOnly;
ContextMenuCommandBuilder.prototype.setGuildOnly = setGuildOnly;
