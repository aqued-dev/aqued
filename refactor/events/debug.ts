import { Events } from 'discord.js';
import type { EventListener } from '../core/types/EventListener.js';
import { Logger } from '../core/Logger.js';
export default class logging implements EventListener<Events.Debug> {
	public name: Events.Debug;
	public once: boolean;
	constructor() {
		this.name = Events.Debug;
		this.once = false;
	}
	async execute(info: string) {
		Logger.info(info);
	}
}
