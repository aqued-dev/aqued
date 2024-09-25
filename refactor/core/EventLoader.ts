import { Client, type ClientEvents } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Logger } from './Logger.js';
import type { EventListener } from './types/EventListener.js';

export class EventLoader {
	private client: Client<boolean>;
	private directory: string;
	private events: Map<string, EventListener[]> = new Map();

	constructor(client: Client, directory: string) {
		this.client = client;
		this.directory = directory;
	}

	public async loadAllEvents(): Promise<void> {
		const files = await readdir(resolve('dist/refactor/', this.directory));
		const listeners: EventListener[] = [];

		Logger.info(`Loading event files from directory: ${this.directory}`);
		for (const file of files) {
			if (!file.startsWith('__')) {
				const listener = await this.loadEvent(file);
				if (listener) {
					listeners.push(listener);
				}
			} else {
				Logger.warn(`Skipping file: ${file} (starts with '__')`);
			}
		}

		for (const listener of listeners) {
			this.registerEvent(listener.name, listener);
		}

		Logger.info(`Successfully loaded ${listeners.length} event listeners.`);
	}

	public async loadEvent(file: string): Promise<EventListener | null> {
		const filePath = resolve('dist/refactor/', this.directory, file);
		const url = pathToFileURL(filePath).href + '?t=' + Date.now();
		const module = (await import(url)).default;
		Logger.info(`Loading Event Listener: ${file}`);
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
