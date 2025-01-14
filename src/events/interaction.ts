import { BaseInteraction, Events } from 'discord.js';
import { oldButtonPaginationDisable } from '../components/button/pagenation.js';
import type { EventListener } from '../core/types/EventListener.js';
import { commandExecuter } from '../middlewares/commandExecuter.js';

export default class InteractionCommandHandler implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}

	async execute(interaction: BaseInteraction) {
		if (
			interaction.isUserContextMenuCommand() ||
			interaction.isMessageContextMenuCommand() ||
			interaction.isChatInputCommand()
		) {
			await commandExecuter(interaction);
		} else if (interaction.isButton()) {
			return await oldButtonPaginationDisable(interaction);
		} else {
			return;
		}
	}
}
