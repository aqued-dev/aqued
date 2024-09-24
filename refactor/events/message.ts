import { Events, Message } from 'discord.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class ready implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async execute(message: Message) {
		console.log(message.content);
	}
}
