import { Message, Events } from 'discord.js';
export default {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		for (const value of message.client.botData.messageFiles) {
			await value(message);
		}
	},
};
