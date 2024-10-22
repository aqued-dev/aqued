import { Colors, EmbedBuilder } from 'discord.js';
import { icons } from '../config/icons.js';

type EmbedType = '成功' | '失敗' | '注意' | '情報';

const iconMap = {
	成功: icons.check,
	失敗: icons.no,
	注意: icons.warn,
	情報: icons.info,
};

function baseEmbed(message: string, type: EmbedType, title?: string, customTitle?: string) {
	const embed = new EmbedBuilder();
	let color: number = Colors.Blue;
	if (type === '失敗') {
		color = Colors.Red;
	} else if (type === '成功') {
		color = Colors.Green;
	} else if (type === '注意') {
		color = Colors.Yellow;
	}
	embed.setAuthor({ name: customTitle ?? type, iconURL: iconMap[type] });
	embed.setDescription(message);
	embed.setColor(color);
	embed.setFooter({ text: 'Aqued' });
	embed.setTimestamp();
	if (title) embed.setTitle(title);
	return embed;
}

export function successEmbed(message: string, title?: string, customTitle?: string) {
	return baseEmbed(message, '成功', title, customTitle);
}

export function failEmbed(message: string, title?: string, customTitle?: string) {
	return baseEmbed(message, '失敗', title, customTitle);
}

export function warnEmbed(message: string, title?: string, customTitle?: string) {
	return baseEmbed(message, '注意', title, customTitle);
}

export function infoEmbed(message: string, title?: string, customTitle?: string) {
	return baseEmbed(message, '情報', title, customTitle);
}
