import { BaseInteraction, Events } from 'discord.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class InteractionCommandHandler implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;
	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async execute(interaction: BaseInteraction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.aqued.commands.chatInput.getCommand(interaction.commandName);
			if (command) await command.run(interaction);
			else
				await interaction.reply({
					content: 'コマンドをリロード中です。',
					ephemeral: true,
				});
		}
	}
}
