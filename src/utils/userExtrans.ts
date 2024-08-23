import {
	ImageURLOptions,
	calculateUserDefaultAvatarIndex,
	User,
	GuildMember,
	Activity,
	ClientPresenceStatusData,
	Client,
	PresenceStatus,
	Snowflake,
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
		extDefaultAvatarURL(options: ImageURLOptions): string;
	}
	interface GuildMember {
		url(): string;
		extDefaultAvatarURL(options: ImageURLOptions): string;
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
function UserExtensionDefaultAvatarURL(options: ImageURLOptions) {
	const index = this.discriminator === '0' ? calculateUserDefaultAvatarIndex(this.id) : this.discriminator % 5;
	const defaultAvatar = this.client.rest.cdn.defaultAvatar(index);
	return this.avatarURL(options) ?? defaultAvatar;
}
function GuildMemberExtensionDefaultAvatarURL(options: ImageURLOptions) {
	return this.avatarURL(options) ?? this.user.extDefaultAvatarURL(options);
}
User.prototype.extPresence = presence;
User.prototype.url = url;
User.prototype.extDefaultAvatarURL = UserExtensionDefaultAvatarURL;
GuildMember.prototype.extDefaultAvatarURL = GuildMemberExtensionDefaultAvatarURL;
GuildMember.prototype.url = url;
