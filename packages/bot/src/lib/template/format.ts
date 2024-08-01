import { User } from 'discord.js';

export const userFormat = (user: User) => {
	return user.discriminator === '0'
		? user.globalName
			? `${user.globalName} (@${user.username})`
			: ` @${user.username}`
		: `${user.globalName ?? user.username} (${user.username}#${user.discriminator})`;
};

// Todo: memberFormat