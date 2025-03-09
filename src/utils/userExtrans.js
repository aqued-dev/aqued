'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var discord_js_1 = require('discord.js');
function url() {
	return 'https://discord.com/users/'.concat(this.id);
}
function presence() {
	for (var _i = 0, _a = this.client.guilds.cache.values(); _i < _a.length; _i++) {
		var guild = _a[_i];
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
function UserExtensionDefaultAvatarURL(options) {
	var _a;
	var index =
		this.discriminator === '0' ? (0, discord_js_1.calculateUserDefaultAvatarIndex)(this.id) : this.discriminator % 5;
	var defaultAvatar = this.client.rest.cdn.defaultAvatar(index);
	return (_a = this.avatarURL(options)) !== null && _a !== void 0 ? _a : defaultAvatar;
}
function GuildMemberExtensionDefaultAvatarURL(options) {
	var _a;
	return (_a = this.avatarURL(options)) !== null && _a !== void 0 ? _a : this.user.extDefaultAvatarURL(options);
}
discord_js_1.User.prototype.extPresence = presence;
discord_js_1.User.prototype.url = url;
discord_js_1.User.prototype.extDefaultAvatarURL = UserExtensionDefaultAvatarURL;
discord_js_1.GuildMember.prototype.extDefaultAvatarURL = GuildMemberExtensionDefaultAvatarURL;
discord_js_1.GuildMember.prototype.url = url;
