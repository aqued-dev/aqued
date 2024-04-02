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
	name: Events | Event;
	once: boolean;
	run(client: Client, ...args: ClientEvents[Event]): Promise<void>;
}
export interface InteractionEventClass {
	run(interaction: BaseInteraction, client: Client): Promise<void>;
}
export interface MessageEventClass {
	run(message: Message, client?: Client): Promise<void>;
}

export interface SlashCommandClass {
	command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
	run(inteaction: ChatInputCommandInteraction): Promise<void>;
	button?(inteaction: ButtonInteraction): Promise<void>;
	modal?(interaction: ModalSubmitInteraction): Promise<void>;
}

export function isMessage(value: unknown): value is MessageEventClass {
	if (typeof value !== 'object' || value === null) return false;
	const { run } = value as MessageEventClass;
	if (typeof run !== typeof Message) return false;
	return true;
}
export function isInteraction(value: unknown): value is InteractionEventClass {
	if (typeof value !== 'object' || value === null) return false;
	const { run } = value as InteractionEventClass;
	if (typeof run !== typeof BaseInteraction) return false;
	return true;
}
