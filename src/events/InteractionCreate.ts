import { BaseInteraction, Events } from 'discord.js';
export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: BaseInteraction) {
		const users: string[] | undefined = await interaction.client.botData.commandExecutors.users.get('users');
		if (users) {
			const shouldPush = users.every((v) => {
				return v !== interaction.user.id;
			});
			if (shouldPush) {
				users.push(interaction.user.id);
			}
		}
		const data = users || [interaction.user.id];
		await interaction.client.botData.commandExecutors.users.set('users', data);
		for (const value of interaction.client.botData.interactionFiles) {
			await value(interaction);
		}
	},
};
