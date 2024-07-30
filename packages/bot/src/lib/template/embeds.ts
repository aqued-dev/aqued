import { EmbedBuilder, Colors } from 'discord.js';

export function unset(ext?: unknown) {
	return {
		embeds: [
			new EmbedBuilder().setColor(Colors.Blue).setAuthor({
				name: '解除しました',
				iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
			}),
		],
		ext,
	};
}
export function set(ext?: unknown) {
	return {
		embeds: [
			new EmbedBuilder().setColor(Colors.Blue).setAuthor({
				name: '登録しました',
				iconURL: 'https://raw.githubusercontent.com/aqued-dev/icon/main/check.png',
			}),
		],
		ext,
	};
}
