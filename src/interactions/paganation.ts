import { BaseInteraction } from 'discord.js';
import { oldButtonPaginationDisable } from '../utils/pagenation.js';
export default async function (interaction: BaseInteraction) {
	if (!interaction.isButton()) return;
	return await oldButtonPaginationDisable(interaction);
}
