import {
	Activity,
	Client,
	ClientPresenceStatusData,
	GuildMember,
	Presence,
	PresenceStatus,
	Snowflake,
	User,
} from 'discord.js';

declare module 'discord.js' {
	interface User {
		url(): string;
		extPresence():
			| {
					activities: Activity[];
					clientStatus: ClientPresenceStatusData | null;
					status: PresenceStatus;
					guild: null;
					member: GuildMember | null;
					user: User | null;
					userId: Snowflake;
					client: Client;
			  }
			| Presence;
	}
	interface GuildMember {
		url(): string;
	}
}

function url() {
	// @ts-expect-error any
	return `https://discord.com/users/${this.id}`;
}

function presence():
	| {
			activities: Activity[];
			clientStatus: ClientPresenceStatusData | null;
			status: PresenceStatus;
			guild: null;
			member: GuildMember | null;
			user: User | null;
			userId: Snowflake;
			client: Client;
	  }
	| Presence {
	// @ts-expect-error any
	for (const guild of this.client.guilds.cache.values()) {
		// @ts-expect-error any
		if (guild.presences.cache.has(this.id)) {
			// @ts-expect-error any
			return guild.presences.cache.get(this.id);
		}
	}
	return {
		activities: [],
		clientStatus: null,
		status: 'offline',
		guild: null,
		member: null,
		// @ts-expect-error any
		user: this,
		// @ts-expect-error any
		userId: this.id,
		// @ts-expect-error any
		client: this.client,
	};
}

User.prototype.extPresence = presence;
User.prototype.url = url;
GuildMember.prototype.url = url;
