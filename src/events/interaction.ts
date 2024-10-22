import { BaseInteraction, Events } from 'discord.js';
import { oldButtonPaginationDisable } from '../components/button/pagenation.js';
import type { EventListener } from '../core/types/EventListener.js';
import { chatInputExecuter } from '../middlewares/chatInputExecuter.js';

export default class InteractionCommandHandler implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}

	async execute(interaction: BaseInteraction) {
		if (interaction.isChatInputCommand()) {
			await chatInputExecuter(interaction);
		} else if (interaction.isButton()) {
			return await oldButtonPaginationDisable(interaction);
		} else {
			return;
		}
	}
}
