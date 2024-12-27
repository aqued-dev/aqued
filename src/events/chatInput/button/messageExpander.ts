import { ButtonInteraction, Events } from 'discord.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { generateCustomId } from '../../../utils/generateCustomId.js';

export default class MessageExpander implements EventListener<Events.InteractionCreate> {
	public name: Events.InteractionCreate;
	public once: boolean;

	constructor() {
		this.name = Events.InteractionCreate;
		this.once = false;
	}
	async setting(interaction: ButtonInteraction, id: string) {
		return [interaction, id];
	}
	async info(interaction: ButtonInteraction, id: string) {
		return [interaction, id];
	}
	async execute(interaction: ButtonInteraction): Promise<unknown> {
		if (!interaction.isButton()) {
			return;
		}
		const setting = generateCustomId('chatinput', 'button', 'message_expander', 'setting', 'userid', '');
		const info = generateCustomId('chatinput', 'button', 'message_expander', 'view', 'userid', '');
		if (interaction.customId.startsWith(setting)) {
			return await this.setting(interaction, interaction.customId.replace(setting, ''));
		} else if (interaction.customId.startsWith(info)) {
			return await this.info(interaction, interaction.customId.replace(info, ''));
		} else {
			return;
		}
	}
}
