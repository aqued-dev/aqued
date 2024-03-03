import {
	BaseInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
	Events,
	Message,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface EventClass<Event extends keyof ClientEvents> {
	name: Events | Exclude<Event, keyof ClientEvents>;
	once: boolean;
	run(...args): Promise<void>;
}
export interface InteractionEventClass {
	run(interaction: BaseInteraction, client: Client): Promise<void>;
}
export interface MessageEventClass {
	run(message: Message, client?: Client): Promise<void>;
}
export interface AnyEventClass {
	run(arg: unknown, client?: Client): Promise<void>;
}
export interface SlashCommandClass {
	command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
	run(inteaction: ChatInputCommandInteraction): Promise<void>;
	button?(inteaction: ButtonInteraction): Promise<void>;
	modal?(interaction: ModalSubmitInteraction): Promise<void>;
}
