import { Client, type ClientEvents } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { EventListener } from './types/EventListener.js';

export class EventLoader {
	private client: Client<boolean>;
	private directory: string;
	private events: Map<string, EventListener[]> = new Map();

	constructor(client: Client, directory: string) {
		this.client = client;
		this.directory = directory;
	}
	public async allLoad(): Promise<void> {
		const files = await readdir(resolve('dist/refactor/', this.directory));
		const listeners: EventListener[] = [];

		for (const file of files) {
			if (!file.startsWith('__')) {
				const listener = await this.load(file);
				if (listener) {
					listeners.push(listener);
				}
			}
		}

		for (const listener of listeners) {
			this.registerEvent(listener.name, [listener]);
		}
	}

	public async load(file: string): Promise<EventListener | null> {
		const filePath = resolve('dist/refactor/', this.directory, file);
		const url = pathToFileURL(filePath).href + '?t=' + Date.now();
		const module = (await import(url)).default;

		return new module();
	}

	private registerEvent(eventName: string, listeners: EventListener[]): void {
		const onceListeners = listeners.filter((listener) => listener.once);
		const normalListeners = listeners.filter((listener) => !listener.once);

		const executeListeners = async (...args: ClientEvents['ready']) => {
			for (const listener of listeners) {
				await listener.execute(...args);
			}
		};

		if (onceListeners.length > 0) {
			this.client.once(eventName, executeListeners);
		}

		if (normalListeners.length > 0) {
			this.client.on(eventName, executeListeners);
		}
	}

	public unload(): void {
		for (const [eventName] of this.events.entries()) {
			this.client.removeAllListeners(eventName);
		}
		this.events.clear();
	}

	public async reload(): Promise<void> {
		this.unload();
		await this.allLoad();
	}
}
