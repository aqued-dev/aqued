import { BaseInteraction } from 'discord.js';
import { oldButtonPaginationDisable } from '../utils/pagenation.js';
export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;
	if (!interaction.customId.startsWith('components_button_pagination_')) return;
	return await oldButtonPaginationDisable(interaction);
}
