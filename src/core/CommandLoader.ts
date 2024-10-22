import { REST, Routes } from 'discord.js';
import { Dirent } from 'node:fs';
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
		Logger.info(`Loading commands from directory: ${this.commandDirectory}`);
		await this.loadDirectory(resolve('dist/src/', this.commandDirectory));
		await this.registerCommands();
	}

	private async loadDirectory(directory: string): Promise<void> {
		const dirents: Dirent[] = await readdir(directory, { withFileTypes: true });
		for (const dirent of dirents) {
			const fullPath = resolve(directory, dirent.name);

			if (dirent.isDirectory()) {
				Logger.info(`Entering directory: ${dirent.name}`);
				await this.loadDirectory(fullPath);
			} else if (!dirent.name.startsWith('__') && dirent.name.endsWith('.js')) {
				const chatInputCommand = await this.loadCommand(fullPath);
				if (chatInputCommand) {
					this.commands.set(chatInputCommand.command.name, chatInputCommand);
					Logger.info(`Loading command: ${chatInputCommand.command.name}.`);
				}
			} else {
				Logger.warn(`Skipping file: ${dirent.name} (starts with '__' or not a .js file)`);
			}
		}
	}

	private async loadCommand(filePath: string): Promise<ChatInputCommand | null> {
		const url = pathToFileURL(filePath).href + '?t=' + Date.now();
		const module = (await import(url)).default;
		return new module();
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
