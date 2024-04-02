import {
	AutocompleteInteraction,
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
	run(interaction: BaseInteraction, client: Client): Promise<unknown>;
}
export interface MessageEventClass {
	run(message: Message, client?: Client): Promise<unknown>;
}

export interface SlashCommandClass {
	command:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder;
	run(interaction: ChatInputCommandInteraction): Promise<unknown>;
	button?(interaction: ButtonInteraction): Promise<unknown>;
	modal?(interaction: ModalSubmitInteraction): Promise<unknown>;
	autoComplete?(interaction: AutocompleteInteraction): Promise<unknown>;
}

export function isMessageEvent(value: unknown): value is MessageEventClass {
	if (typeof value !== 'object' || value === null) return false;
	const { run } = value as MessageEventClass;
	if (typeof run !== typeof Message) return false;
	return true;
}
export function isInteractionEvent(value: unknown): value is InteractionEventClass {
	if (typeof value !== 'object' || value === null) return false;
	const { run } = value as InteractionEventClass;
	if (typeof run !== typeof BaseInteraction) return false;
	return true;
}
