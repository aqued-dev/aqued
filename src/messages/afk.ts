import { Colors, EmbedBuilder, Message } from 'discord.js';
export default async function (message: Message) {
	const { afk, mention } = message.client.botData.afk;
	if ((await afk.get(message.author.id)) && message.inGuild()) {
		const mentions: string[] | undefined = await mention.get(message.author.id);
		const embed = new EmbedBuilder().setTitle('afkを解除しました。').setColor(Colors.Blue);
		if (mentions) {
			embed.addFields({ name: 'メンション', value: mentions.join('\n') });
		}
		await message.channel.send({ embeds: [embed] });
		await mention.delete(message.author.id);
		await afk.delete(message.author.id);
	}
	if (message.mentions.users.size > 0 && message.inGuild()) {
		for (const value of message.mentions.users.values()) {
			const mentions: string[] | undefined = await mention.get(value.id);
			const array = mentions ?? [];
			if (!(await afk.get(value.id))) {
				continue;
			}
			array.push(
				`[${message.guild.name} > #${message.channel.name}](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`,
			);
			const embed = new EmbedBuilder().setDescription(`<@!${value.id}>はafkです。`).setColor(Colors.Blue);
			if ((await afk.get(value.id)) && (await afk.get(value.id)) !== true) {
				embed.addFields({ name: '理由', value: await afk.get(value.id) });
			}
			await message.channel.send({ embeds: [embed] });
			if (array.length > 0) {
				await mention.set(value.id, array);
			}
		}
	}
}
