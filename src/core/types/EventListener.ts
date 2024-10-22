import { type ClientEvents } from 'discord.js';

export interface EventListener<Event extends keyof ClientEvents = keyof ClientEvents> {
	name: Event;
	once: boolean;
	execute(...args: ClientEvents[Event]): Promise<unknown>;
}
