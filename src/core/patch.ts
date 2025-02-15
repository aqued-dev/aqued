import { config } from '../config/config.js';
import { CommandLoader } from './CommandLoader.js';
import { EventLoader } from './EventLoader.js';
import { ChatInputCommand } from './types/ChatInputCommand.js';
import { MessageContextMenuCommand, UserContextMenuCommand } from './types/ContextCommand.js';

/**
 * Discord.js Patch
 */
declare module 'discord.js' {
	// Client 拡張
	interface Client {
		aqued: {
			events: EventLoader;
			config: typeof config;
			commands: CommandLoader<ChatInputCommand | MessageContextMenuCommand | UserContextMenuCommand>;
			readyId: string;
			cooldown: Map<string, Map<string, number>>;
			freeChannelCooldown: Map<string, Map<string, number>>;
			rolePanelCache: Map<string, { id: string; name: string }[]>;
		};
	}
}
