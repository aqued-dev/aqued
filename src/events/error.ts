import { Events } from 'discord.js';
import { inspect } from 'util';
import { Logger } from '../core/Logger.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class logging implements EventListener<Events.Error> {
	public name: Events.Error;
	public once: boolean;
	constructor() {
		this.name = Events.Error;
		this.once = false;
	}
	async execute(error: Error) {
		Logger.error(inspect(error));
	}
}
