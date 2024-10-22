import { Colors, EmbedBuilder } from 'discord.js';
import { icons } from '../config/icons.js';

type EmbedType = '成功' | '失敗' | '注意' | '情報' | '返信';

const iconMap = {
	成功: icons.check,
	失敗: icons.no,
	注意: icons.warn,
	情報: icons.info,
	返信: icons.reply
};

function baseEmbed(type: EmbedType, message?: string, title?: string, customTitle?: string, footer?: string) {
	const embed = new EmbedBuilder();
	let color: number = Colors.Blue;
	if (type === '失敗') {
		color = Colors.Red;
	} else if (type === '成功') {
		color = Colors.Green;
	} else if (type === '注意') {
		color = Colors.Yellow;
	} else if (type === '返信') {
		color = Colors.Orange;
	}
	embed.setAuthor({ name: customTitle ?? type, iconURL: iconMap[type] });
	embed.setDescription(message ?? '');
	embed.setColor(color);
	embed.setFooter({ text: footer ?? 'Aqued' });
	embed.setTimestamp();
	if (title) embed.setTitle(title);
	return embed;
}

export function successEmbed(message?: string, title?: string, customTitle?: string, footer?: string) {
	return baseEmbed('成功', message, title, customTitle, footer);
}

export function failEmbed(message?: string, title?: string, customTitle?: string, footer?: string) {
	return baseEmbed('失敗', message, title, customTitle, footer);
}

export function warnEmbed(message?: string, title?: string, customTitle?: string, footer?: string) {
	return baseEmbed('注意', message, title, customTitle, footer);
}

export function infoEmbed(message?: string, title?: string, customTitle?: string, footer?: string) {
	return baseEmbed('情報', message, title, customTitle, footer);
}
export function replyEmbed(message?: string, title?: string, customTitle?: string, footer?: string) {
	return baseEmbed('返信', message, title, customTitle, footer);
}
