import { ChannelType, Message } from 'discord.js';

export default async function (message: Message) {
	if (message.author.system) return;
	if (message.channel.type !== ChannelType.GuildAnnouncement) return;
	if (!(await message.client.botData.aquedAutoNews.get(message.channelId))) return;
	if (message.crosspostable) {
		message.crosspost().then(() => message.react('✅'));
	} else {
		message.react('❌');
	}
}
