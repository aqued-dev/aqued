import { ChannelType, Events, Message } from 'discord.js';
import { emojis } from '../../../config/emojis.js';
import { Logger } from '../../../core/Logger.js';
import { SettingManager } from '../../../core/SettingManager.js';
import type { EventListener } from '../../../core/types/EventListener.js';
export default class autoNews implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}

	async execute(message: Message) {
		if (message.author.bot || !message.inGuild()) {
			return;
		}
		if (message.channel.type !== ChannelType.GuildAnnouncement) {
			return;
		}
		const manager = new SettingManager({ channelId: message.channelId });
		const data = await manager.getChannel();
		if (!data || (data && !data.autoNews)) {
			return;
		}
		if (message.crosspostable) {
			message
				.crosspost()
				.then(async () => message.react(emojis().check))
				.catch((error) => {
					Logger.error(error);
					message.react(emojis().no);
				});
			if (message.reactions.cache.size === 0) {
				await message.react(emojis().no);
			}
		}
	}
}
