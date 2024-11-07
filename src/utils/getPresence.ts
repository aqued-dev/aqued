import { Presence, User } from 'discord.js';

export function getPresence(user: User): Presence {
	for (const guild of user.client.guilds.cache.values()) {
		const data = guild.presences.cache.get(user.id);
		if (data) {
			return data;
		}
	}

	return {
		activities: [],
		clientStatus: null,
		status: 'invisible',
		guild: null,
		member: null,
		user: user,
		userId: user.id,
		client: user.client,
		equals: (_presence: Presence) => true,
		toJSON: (..._props: unknown[]) => {}
	} as unknown as Presence;
}
