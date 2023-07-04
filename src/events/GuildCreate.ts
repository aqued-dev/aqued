import { ActivityType, Events, Guild } from 'discord.js';

export default {
	name: Events.GuildCreate,
	once: false,
	async execute(guild: Guild) {
		const { botData, user, guilds } = guild.client;
		user.setPresence({
			status: 'online',
			activities: [
				{
					name: '/help | ' + guilds.cache.size + ' Guilds | v' + (await botData.infos.get('version')),
					type: ActivityType.Playing,
				},
			],
		});
	},
};
