/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageURLOptions, calculateUserDefaultAvatarIndex } from '@discordjs/rest';
import {
	Collection,
	User,
	ChatInputCommandInteraction,
	EmbedBuilder,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	RESTPostAPIContextMenuApplicationCommandsJSONBody,
	UserContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	REST,
	Colors,
	GuildMember,
	StringSelectMenuInteraction,
	ButtonInteraction,
	RoleSelectMenuInteraction,
	SlashCommandBuilder,
	ContextMenuCommandBuilder,
	Message,
} from 'discord.js';
import { MongoDB } from './MongoDB.js';
declare module 'discord.js' {
	interface Client {
		botData: {
			commands: {
				chatInput: Array<{ name: string; data: any }>;
				userCotextMenu: Array<{ name: string; data: any }>;
				messageCotextMenu: Array<{ name: string; data: any }>;
			};
			load: {
				chatinput: boolean;
				messagecotextmenu: boolean;
				usercotextmenu: boolean;
			};
			commandExecutors: { serverUpNotice: MongoDB; number: MongoDB; users: MongoDB };
			interactionFiles: any[];
			messageFiles: any[];
			owners: string[];
			gbans: MongoDB;
			guildUpNotice: { dissoku: MongoDB; disboard: MongoDB };
			mods: string[];
			cooldowns?: Collection<string, any>;
			reboot: boolean;
			errors: MongoDB;
			artifacter: MongoDB;
			forcePin: MongoDB;
			infos: MongoDB;
			errorChannelId: string;
			botLogChannelId: string;
			globalChat: { register: MongoDB; messages: MongoDB; blocks: MongoDB };
			aquedAutoNews: MongoDB;
			commandLogChannelId: string;
			commandDatas: Array<
				RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody
			>;
			rest: REST;
			clientId: string;
		};
	}
	interface User {
		url(): string;
		extDefaultAvatarURL(options: ImageURLOptions): string;
	}
	interface GuildMember {
		url(): string;
		extDefaultAvatarURL(options: ImageURLOptions): string;
	}
	interface ChatInputCommandInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface UserContextMenuCommandInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface MessageContextMenuCommandInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface StringSelectMenuInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface RoleSelectMenuInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface ButtonInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface SlashCommandBuilder {
		setGuildOnly(): SlashCommandBuilder;
	}
	interface ContextMenuCommandBuilder {
		setGuildOnly(): ContextMenuCommandBuilder;
	}
}
async function error(title: string, description: string, ephemeral: boolean) {
	if (this.deferred || this.replied)
		return await this.followUp({
			ephemeral,
			embeds: [
				new EmbedBuilder()
					.setColor(Colors.Red)
					.setTitle('❌ ' + title)
					.setDescription(description),
			],
		});
	return await this.reply({
		fetchReply: true,
		ephemeral,
		embeds: [
			new EmbedBuilder()
				.setColor(Colors.Red)
				.setTitle('❌ ' + title)
				.setDescription(description),
		],
	});
}
async function ok(title: string, description: string, ephemeral: boolean) {
	if (this.deferred || this.replied)
		return await this.followUp({
			ephemeral,
			embeds: [
				new EmbedBuilder()
					.setColor(Colors.Blue)
					.setTitle('✅ ' + title)
					.setDescription(description),
			],
		});
	return await this.reply({
		fetchReply: true,
		ephemeral,
		embeds: [
			new EmbedBuilder()
				.setColor(Colors.Blue)
				.setTitle('✅ ' + title)
				.setDescription(description),
		],
	});
}
function setGuildOnly() {
	return this.setDMPermission(false);
}
function url() {
	return `https://discord.com/users/${this.id}`;
}
function UserExtensionDefaultAvatarURL(options: ImageURLOptions) {
	const index = this.discriminator === '0' ? calculateUserDefaultAvatarIndex(this.id) : this.discriminator % 5;
	const defaultAvatar = this.client.rest.cdn.defaultAvatar(index);
	return this.avatarURL(options) ?? defaultAvatar;
}
function GuildMemberExtensionDefaultAvatarURL(options: ImageURLOptions) {
	return this.avatarURL(options) ?? this.user.extDefaultAvatarURL(options);
}

SlashCommandBuilder.prototype.setGuildOnly = setGuildOnly;
ContextMenuCommandBuilder.prototype.setGuildOnly = setGuildOnly;
ChatInputCommandInteraction.prototype.error = error;
UserContextMenuCommandInteraction.prototype.error = error;
StringSelectMenuInteraction.prototype.error = error;
MessageContextMenuCommandInteraction.prototype.error = error;
RoleSelectMenuInteraction.prototype.error = error;
ButtonInteraction.prototype.error = error;
RoleSelectMenuInteraction.prototype.ok = ok;
ChatInputCommandInteraction.prototype.ok = ok;
ButtonInteraction.prototype.ok = ok;
UserContextMenuCommandInteraction.prototype.ok = ok;
StringSelectMenuInteraction.prototype.ok = ok;
MessageContextMenuCommandInteraction.prototype.ok = ok;
User.prototype.url = url;
User.prototype.extDefaultAvatarURL = UserExtensionDefaultAvatarURL;
GuildMember.prototype.extDefaultAvatarURL = GuildMemberExtensionDefaultAvatarURL;
GuildMember.prototype.url = url;
