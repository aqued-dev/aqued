/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Collection,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	REST,
	SlashCommandBuilder,
	ContextMenuCommandBuilder,
} from 'discord.js';
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
			sgcJsonChannelIdv2: string;
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
	interface RESTPostAPIContextMenuApplicationCommandsJSONBody {
		description: string | undefined;
	}
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

SlashCommandBuilder.prototype.setGuildOnly = setGuildOnly;
ContextMenuCommandBuilder.prototype.setGuildOnly = setGuildOnly;
