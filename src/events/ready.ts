import { Client, Events } from 'discord.js';
import { Logger } from '../core/Logger.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class ready implements EventListener<Events.ClientReady> {
	public name: Events.ClientReady;
	public once: boolean;
	constructor() {
		this.name = Events.ClientReady;
		this.once = true;
	}
	async execute(client: Client) {
		Logger.info(`Login Bot: ${client.user?.tag}`);
	}
}
