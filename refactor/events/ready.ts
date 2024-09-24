import { Client, Events } from 'discord.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class ready implements EventListener<Events.ClientReady> {
	public name: Events.ClientReady;
	public once: boolean;
	constructor() {
		this.name = Events.ClientReady;
		this.once = false;
	}
	async execute(client: Client) {
		console.log(client.user?.tag);
	}
}
