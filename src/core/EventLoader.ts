import { Client, type ClientEvents } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Logger } from './Logger.js';
import type { EventListener } from './types/EventListener.js';
import { Dirent } from 'node:fs';

export class EventLoader {
	private client: Client<boolean>;
	private directory: string;
	private events: Map<string, EventListener[]> = new Map();

	constructor(client: Client, directory: string) {
		this.client = client;
		this.directory = directory;
	}

	public async loadAllEvents(): Promise<void> {
		const listeners: EventListener[] = [];

		Logger.info(`Loading event files from directory: ${this.directory}`);
		await this.loadDirectory(resolve('dist/src/', this.directory), listeners);

		for (const listener of listeners) {
			this.registerEvent(listener.name, listener);
		}

		Logger.info(`Successfully loaded ${listeners.length} event listeners.`);
	}

	private async loadDirectory(directory: string, listeners: EventListener[]): Promise<void> {
		const dirents: Dirent[] = await readdir(directory, { withFileTypes: true });
		for (const dirent of dirents) {
			const fullPath = resolve(directory, dirent.name);

			if (dirent.isDirectory()) {
				Logger.info(`Entering directory: ${dirent.name}`);
				await this.loadDirectory(fullPath, listeners);
			} else if (!dirent.name.startsWith('__')) {
				const listener = await this.loadEvent(fullPath);
				if (listener) {
					listeners.push(listener);
				}
			} else {
				Logger.warn(`Skipping file: ${dirent.name} (starts with '__')`);
			}
		}
	}

	public async loadEvent(filePath: string): Promise<EventListener | null> {
		const url = pathToFileURL(filePath).href + '?t=' + Date.now();
		const module = (await import(url)).default;
		Logger.info(`Loading Event Listener: ${filePath}`);
		return new module();
	}

	private registerEvent(eventName: string, listener: EventListener): void {
		const executeListener = async (...args: ClientEvents[keyof ClientEvents]) => {
			await listener.execute(...args);
		};

		if (listener.once) {
			this.client.once(eventName, executeListener);
			Logger.info(`Registered once listener for event: ${eventName}`);
		} else {
			this.client.on(eventName, executeListener);
			Logger.info(`Registered normal listener for event: ${eventName}`);
		}

		if (!this.events.has(eventName)) {
			this.events.set(eventName, []);
		}
		this.events.get(eventName)!.push(listener);
	}

	public unloadAllEvents(): void {
		for (const eventName of this.events.keys()) {
			this.client.removeAllListeners(eventName);
			Logger.info(`Removed all listeners for event: ${eventName}`);
		}
		this.events.clear();
		Logger.info(`Unloading events.`);
	}

	public async reloadAllEvents(): Promise<void> {
		this.unloadAllEvents();
		await this.loadAllEvents();
		Logger.info(`Reloading events.`);
	}
}
