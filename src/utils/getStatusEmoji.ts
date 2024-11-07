import type { PresenceStatus } from 'discord.js';
import { emojis } from '../config/emojis.js';

export function getStatusEmoji(status: PresenceStatus) {
	const emoji = emojis();
	if (status === 'online') {
		return emoji.online;
	} else if (status === 'idle') {
		return emoji.idle;
	} else if (status === 'dnd') {
		return emoji.dnd;
	} else if (status === 'offline' || status === 'invisible') {
		return emoji.offline;
	} else {
		return emoji.offline;
	}
}
export function getStatusEmojiText(status: PresenceStatus) {
	const emoji = getStatusEmoji(status);
    if (status === 'online') {
		return `${emoji} オンライン`;
	} else if (status === 'idle') {
		return `${emoji} 離席中`;
	} else if (status === 'dnd') {
		return `${emoji} 取り込み中`;
	} else if (status === 'offline' || status === 'invisible') {
		return `${emoji} オフライン`;
	} else {
		return `${emoji} オフライン`;
	}
}
