import {
	Activity,
	Client,
	ClientPresenceStatusData,
	GuildMember,
	PresenceStatus,
	Snowflake,
	User,
} from 'discord.js';

declare module 'discord.js' {
	interface User {
		url(): string;
		extPresence(): {
			activities: Activity[];
			clientStatus: ClientPresenceStatusData | null;
			status: PresenceStatus;
			guild: null;
			member: GuildMember | null;
			user: User | null;
			userId: Snowflake;
			client: Client;
		};
	}
	interface GuildMember {
		url(): string;
	}
}

function url() {
	return `https://discord.com/users/${this.id}`;
}

function presence(): {
	activities: Activity[];
	clientStatus: ClientPresenceStatusData | null;
	status: PresenceStatus;
	guild: null;
	member: GuildMember | null;
	user: User | null;
	userId: Snowflake;
	client: Client;
} {
	for (const guild of this.client.guilds.cache.values()) {
		if (guild.presences.cache.has(this.id)) return guild.presences.cache.get(this.id);
	}
	return {
		activities: [],
		clientStatus: null,
		status: 'offline',
		guild: null,
		member: null,
		user: this,
		userId: this.id,
		client: this.client,
	};
}

User.prototype.extPresence = presence;
User.prototype.url = url;
GuildMember.prototype.url = url;
