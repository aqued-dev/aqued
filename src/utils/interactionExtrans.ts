/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	UserContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	Colors,
	StringSelectMenuInteraction,
	ButtonInteraction,
	RoleSelectMenuInteraction,
	ModalSubmitInteraction,
	Message,
} from 'discord.js';
declare module 'discord.js' {
	interface ChatInputCommandInteraction {
		error: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
		ok: (title: string, description: string, ephemeral: boolean) => Promise<Message>;
	}
	interface ModalSubmitInteraction {
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

ChatInputCommandInteraction.prototype.error = error;
UserContextMenuCommandInteraction.prototype.error = error;
StringSelectMenuInteraction.prototype.error = error;
MessageContextMenuCommandInteraction.prototype.error = error;
RoleSelectMenuInteraction.prototype.error = error;
ButtonInteraction.prototype.error = error;
ModalSubmitInteraction.prototype.error = error;
ModalSubmitInteraction.prototype.ok = ok;
RoleSelectMenuInteraction.prototype.ok = ok;
ChatInputCommandInteraction.prototype.ok = ok;
ButtonInteraction.prototype.ok = ok;
UserContextMenuCommandInteraction.prototype.ok = ok;
StringSelectMenuInteraction.prototype.ok = ok;
MessageContextMenuCommandInteraction.prototype.ok = ok;
