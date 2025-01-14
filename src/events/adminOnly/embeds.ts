import { Events, Message } from 'discord.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { disableEmbed, enableEmbed } from '../../embeds/booleanEmbed.js';
import { deleteEmbed, failEmbed, infoEmbed, replyEmbed, successEmbed, warnEmbed } from '../../embeds/infosEmbed.js';
export default class MessageCreate implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async execute(message: Message) {
		if (message.client.aqued.config.bot.admins.includes(message.author.id)) {
			if (message.content === 'aq.embeds') {
				await message.reply({
					embeds: [
						successEmbed('Example', 'ExampleTitle'),
						failEmbed('Example', 'ExampleTitle'),
						warnEmbed('Example', 'ExampleTitle'),
						infoEmbed('Example', 'ExampleTitle'),
						enableEmbed('Example'),
						disableEmbed('Example'),
						replyEmbed('Example', 'ExampleTitle'),
						deleteEmbed('Example', 'ExampleTitle')
					]
				});
			}
		}
	}
}
