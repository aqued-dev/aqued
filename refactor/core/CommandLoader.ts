import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Logger } from './Logger.js';
import type { ChatInputCommand } from './types/ChatInputCommand.js';

export class CommandLoader {
	private commands: Map<string, ChatInputCommand> = new Map();
	private commandDirectory: string;

	constructor(commandDirectory: string) {
		this.commandDirectory = commandDirectory;
		this.loadCommands().catch((reason) => console.error(reason));
	}

	private async loadCommands(): Promise<void> {
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

	async reloadCommand(name: string): Promise<void> {
		this.unloadCommand(name);
		const filePath = resolve(this.commandDirectory, `${name}.js`);
		const url = pathToFileURL(filePath).href + '?t=' + Date.now();
		const module = await import(url);
		if (module && typeof module.run === 'function') {
			const chatInput: ChatInputCommand = new module();
			this.commands.set(chatInput.command.name, chatInput);
			Logger.info(`Reloading ${chatInput.command.name}.`);
		}
	}
}
