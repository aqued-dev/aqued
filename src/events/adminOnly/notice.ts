import { ChannelType, Events, Message, time, WebhookClient } from 'discord.js';
import type { EventListener } from '../../core/types/EventListener.js';
export default class MessageCreate implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async execute(message: Message) {
		if (message.client.aqued.config.bot.admins.includes(message.author.id)) {
			if (message.content.startsWith('aq.notice')) {
				const channel = message.channel;
				if (channel.type !== ChannelType.GuildText) {
					if (channel.isSendable()) return message.reply('テキストチャンネル以外では実行できません');
					return;
				}
				message.reply('内容を送信してください。(2分以内)');
				const args = message.content.split(' ');
				const webhook = new WebhookClient({ url: args[1] ?? '' });
				const filter = (msg: Message) => msg.author.id === message.author.id;
				const collected = await channel.awaitMessages({ filter, max: 1, time: 120000 });
				const response = collected.first();
				if (!response) return message.reply('タイムアウトしました。');
				const waitMessage = await message.reply('送信します！');
				const after = `\n====================\nAqued Notice Team 一同\nPublish Date: ${time(new Date(), 'F')}\nMention : ${args[2]}`;
				return await webhook
					.send({
						content: response.content + after,
						avatarURL: message.client.user.displayAvatarURL(),
						username: 'Aqued Notice'
					})
					.then(() => waitMessage.edit('送信しました。'));
			}
		}
		return;
	}
}
