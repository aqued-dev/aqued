import {
	BaseInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	Events,
	SlashCommandBuilder,
} from 'discord.js';

export interface EventClass<Event extends keyof ClientEvents> {
	name: Events | Exclude<Event, keyof ClientEvents>;
	once: boolean;
	run(...args): Promise<void>;
}
export interface InteractionEventClass {
	run(interaction: BaseInteraction, client: Client): Promise<void>;
}
export interface SlashCommandClass {
	command: SlashCommandBuilder;
	run(inteaction: ChatInputCommandInteraction): Promise<void>;
	button?(inteaction: ButtonInteraction): Promise<void>;
}
