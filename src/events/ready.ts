import { ActivityType, Client, Events, PresenceUpdateStatus } from 'discord.js';
import { constants } from '../config/constants.js';
import { Logger } from '../core/Logger.js';
import type { EventListener } from '../core/types/EventListener.js';
export default class ready implements EventListener<Events.ClientReady> {
	public name: Events.ClientReady;
	public once: boolean;
	constructor() {
		this.name = Events.ClientReady;
		this.once = true;
	}
	async execute(client: Client<true>) {
		Logger.info(`Login Bot: ${client.user.tag}`);
		client.user.setPresence({
			status: PresenceUpdateStatus.Online,
			activities: [
				{ name: `/help | ${client.guilds.cache.size} Servers | v${constants.version}`, type: ActivityType.Custom }
			]
		});
	}
}
