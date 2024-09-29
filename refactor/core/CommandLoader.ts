import { REST, Routes } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from '../config/config.js';
import { Logger } from './Logger.js';
import type { ChatInputCommand } from './types/ChatInputCommand.js';

export class CommandLoader {
	private commands: Map<string, ChatInputCommand> = new Map();
	private commandDirectory: string;

	constructor(commandDirectory: string) {
		this.commandDirectory = commandDirectory;
		this.loadAllCommands().catch((reason) => console.error(reason));
	}

	private async loadAllCommands(): Promise<void> {
		const files = await readdir(resolve('dist/refactor/', this.commandDirectory));

		for (const file of files) {
			if (file.startsWith('__')) continue;
			const filePath = resolve('dist/refactor/', this.commandDirectory, file);
			const url = pathToFileURL(filePath).href + '?t=' + Date.now();
			const module = (await import(url)).default;
			const chatInput: ChatInputCommand = new module();
			this.commands.set(chatInput.command.name, chatInput);
			Logger.info(`Loading ${chatInput.command.name}.`);
		}
		await this.registerCommands();
	}
	private async registerCommands() {
		const rest = new REST().setToken(config.bot.token);
		await rest.put(Routes.applicationCommands(config.bot.id), {
			body: Array.from(this.commands.values()).map((item) => item.command.toJSON()),
		});
	}
	getCommand(name: string): ChatInputCommand | undefined {
		return this.commands.get(name);
	}
	hasCommand(name: string): boolean {
		return this.commands.has(name);
	}
	unloadCommand(name: string): void {
		this.commands.delete(name);
		Logger.info(`Unloading ${name}.`);
	}

	async reloadAllCommands(): Promise<void> {
		for (const name of this.commands.keys()) {
			this.unloadCommand(name);
		}
		await this.loadAllCommands();
	}
}
