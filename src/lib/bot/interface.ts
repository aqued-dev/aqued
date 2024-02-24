import { ClientEvents, Events, SlashCommandBuilder } from 'discord.js';

export interface EventClass<Event extends keyof ClientEvents> {
	name: Events | Exclude<Event, keyof ClientEvents>;
	once: boolean;
	run(...args): Promise<void>;
}

export interface SlashCommandClass {
	command: SlashCommandBuilder;
	run(...args): Promise<void>;
}
