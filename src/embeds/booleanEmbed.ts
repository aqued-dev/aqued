import { Colors, EmbedBuilder } from 'discord.js';
import { icons } from '../config/icons.js';
function baseEmbed(message: string) {
	const embed = new EmbedBuilder();
	embed.setAuthor({ name: '成功', iconURL: icons.check });
	embed.setDescription(message);
	embed.setColor(Colors.Blue);
	embed.setFooter({ text: 'Aqued' });
	embed.setTimestamp();
	return embed;
}
export function enableEmbed(name?: string) {
	let base = `\`\`有効\`\`になりました`;
	if (name) {
		base = `${name}が` + base;
	}
	return baseEmbed(base);
}
export function disableEmbed(name?: string) {
	let base = `\`\`無効\`\`になりました`;
	if (name) {
		base = `${name}が` + base;
	}
	return baseEmbed(base);
}
