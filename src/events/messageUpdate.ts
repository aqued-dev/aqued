import { Message, Events, EmbedBuilder, Colors } from 'discord.js';
export default {
	name: Events.MessageUpdate,
	once: false,
	async execute(oldMessage: Message, newMessage: Message) {
		if (!(await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId))) return;
		if (newMessage.author.id !== '761562078095867916') return;
		if (
			newMessage.embeds[0] &&
			newMessage.embeds[0].fields[0] &&
			newMessage.embeds[0].fields[0].value.includes('ActiveLevel')
		) {
			newMessage.channel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle('UPしました！')
						.setDescription(`<t:${Math.floor(Date.now() / 1000) + 3600}:F> にお知らせします。`)
						.setColor(Colors.Blue),
				],
			});
			setTimeout(async () => {
				const role = await newMessage.client.botData.guildUpNotice.dissoku.get(newMessage.guildId + '_role');
				if (role) {
					newMessage.channel.send({
						content: `<@&${role}>`,
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</dissoku up:828002256690610256> でupできます。')
								.setColor(Colors.Blue),
						],
						allowedMentions: { parse: ['roles'] },
					});
				} else {
					newMessage.channel.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('UPできます！')
								.setDescription('</dissoku up:828002256690610256> でupできます。')
								.setColor(Colors.Blue),
						],
					});
				}
			}, 3_600_000);
		}
	},
};
