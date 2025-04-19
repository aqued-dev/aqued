import { calculateUserDefaultAvatarIndex } from 'discord.js';

export function multiCalculateUserDefaultAvatarIndex(id: string, discriminator: string) {
	if (discriminator === '0' || discriminator === '0000') {
		return calculateUserDefaultAvatarIndex(id);
	}

	return Number(discriminator) % 5;
}

export function defaultAvatarUrl(index: number) {
	return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
