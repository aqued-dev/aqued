import { GuildMember, User } from 'discord.js';

export interface SimpleUser {
	username: string;
	discriminator: string;
	globalName: string | null | undefined;
	id: string;
}
const getUserName = ({ discriminator, globalName, username }: User | SimpleUser) => {
	if (discriminator === '0') {
		return globalName ? `${globalName} (@${username})` : `@${username}`;
	} else if (discriminator === '0000') {
		return username;
	} else {
		return globalName ? `${globalName} (${username}#${discriminator})` : `${username}#${discriminator}`;
	}
};

export const userFormat = (user: User | GuildMember | SimpleUser): string => {
	if (user instanceof GuildMember) {
		const { nickname, user: memberUser } = user;
		const formattedName = getUserName(memberUser);
		return nickname ? `${nickname} (${formattedName})` : formattedName;
	}

	return getUserName(user);
};
