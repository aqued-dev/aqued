import { EmbedBuilder, Message, Colors } from 'discord.js';

export default async function (message: Message) {
	if (!(await message.client.botData.guildUpNotice.disboard.get(message.guildId))) return;
	if (
		message.author.id === '302050872383242240' &&
		message.embeds[0] &&
		message.embeds[0].image &&
		message.embeds[0].image.url.includes('disboard.org/images/bot-command-image-bump.png')
	) {
		message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Bumpしました！')
					.setDescription(`<t:${Math.floor(Date.now() / 1000) + 7200}:F> にお知らせします。`)
					.setColor(Colors.Blue),
			],
		});
		setTimeout(async () => {
			const role = await message.client.botData.guildUpNotice.disboard.get(message.guildId + '_role');
			if (role) {
				message.channel.send({
					content: `<@&${role}>`,
					embeds: [
						new EmbedBuilder()
							.setTitle('Bumpできます！')
							.setDescription('</bump:947088344167366698> でbumpできます。')
							.setColor(Colors.Blue),
					],
					allowedMentions: { parse: ['roles'] },
				});
			} else {
				message.channel.send({
					embeds: [
						new EmbedBuilder()
							.setTitle('Bumpできます！')
							.setDescription('</bump:947088344167366698> でbumpできます。')
							.setColor(Colors.Blue),
					],
				});
			}
		}, 7_200_000);
	}
}
