import { GuildMember, User } from 'discord.js';

export const userFormat = (user: User | GuildMember): string => {
	const getUserName = (u: User) => {
		if (u.discriminator === '0') {
			return u.globalName ? `${u.globalName} (@${u.username})` : `@${u.username}`;
		} else {
			return u.globalName ? `${u.globalName} (${u.username}#${u.discriminator})` : `${u.username}#${u.discriminator}`;
		}
	};

	if (user instanceof User) {
		return getUserName(user);
	}

	if (user instanceof GuildMember) {
		const { nickname, user: memberUser } = user;
		const formattedName = getUserName(memberUser);
		return nickname ? `${nickname} (${formattedName})` : formattedName;
	}

	return '不明なユーザー(これはバグです。Aqued開発者に報告してください)';
};
