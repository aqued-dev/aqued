import { type ClientEventTypes } from 'discord.js';

export interface EventListener<Event extends keyof ClientEventTypes = keyof ClientEventTypes> {
	name: Event;
	once: boolean;
	execute(...args: ClientEventTypes[Event]): Promise<unknown>;
}
