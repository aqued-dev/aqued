import {
	Collection,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

import './interactionExtrans.js';
import { MongoDB } from './MongoDB.js';
import './userExtrans.js';
declare module 'discord.js' {
	interface Client {
		botData: {
			commands: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				chatInput: Array<{ name: string; data: any }>;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				userCotextMenu: Array<{ name: string; data: any }>;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
			interactionFiles: Function[];
			// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
			messageFiles: Function[];
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
			cooldowns?: Collection<string, unknown>;
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
