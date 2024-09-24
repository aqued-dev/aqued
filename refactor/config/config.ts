import configData from '../../config.json' with { type: 'json' };

class Config {
	public bot: { id: string; admins: string[]; token: string; mods: string[] } = {
		id: '',
		admins: [],
		token: '',
		mods: [],
	};
	public channels: { error: string; log: string; command: string } = { error: '', log: '', command: '' };
	public mongo: { url: string; key: string } = { url: '', key: '' };
	public loads: { chatInput: boolean; messageContextMenu: boolean; userContextMenu: boolean } = {
		chatInput: true,
		messageContextMenu: true,
		userContextMenu: true,
	};
	public sgcJsonChannels: { v1: string; v2: string } = { v1: '', v2: '' };
	public mysql: { host: string; port: number; user: string; password: string } = {
		host: 'db',
		port: 1644,
		user: 'user',
		password: 'password',
	};
	setId(id: string) {
		this.bot.id = id;
	}
	setToken(token: string) {
		this.bot.token = token;
	}

	setAdmins(users: string[]) {
		this.bot.admins = users;
	}

	setMods(users: string[]) {
		this.bot.mods = users;
	}

	setErrorChannel(id: string) {
		this.channels.error = id;
	}

	setLogChannel(id: string) {
		this.channels.log = id;
	}

	setCommandLogChannel(id: string) {
		this.channels.log = id;
	}

	setMongoUrl(url: string) {
		this.mongo.url = url;
	}

	setMongoKey(key: string) {
		this.mongo.key = key;
	}

	setLoads(data: { chatInput: boolean; messageContextMenu: boolean; userContextMenu: boolean }) {
		this.loads = data;
	}

	setSgcJsonChannel(data: { v1: string; v2: string }) {
		this.sgcJsonChannels = data;
	}
	setMySQLHost(host: string) {
		this.mysql.host = host;
	}
	setMySQLPort(port: number) {
		this.mysql.port = port;
	}
	setMySQLUser(user: string) {
		this.mysql.user = user;
	}
	setMySQLPassword(password: string) {
		this.mysql.password = password;
	}
}

const config = new Config();

config.setId(configData.clientId);
config.setToken(configData.token);
config.setAdmins(configData.owners);
config.setMods(configData.mods);
config.setErrorChannel(configData.channelIds.error);
config.setLogChannel(configData.channelIds.botLog);
config.setCommandLogChannel(configData.channelIds.commandLog);
config.setMongoUrl(configData.mongoDBUrl);
config.setMongoKey(configData.key);
config.setLoads({
	chatInput: configData.load.chatinput,
	messageContextMenu: configData.load.messagecotextmenu,
	userContextMenu: configData.load.usercotextmenu,
});
config.setSgcJsonChannel({
	v1: configData.sgcJsonChannelId,
	v2: configData.sgcJsonChannelIdv2,
});
config.setMySQLHost(configData.mysql.host);
config.setMySQLPort(configData.mysql.port);
config.setMySQLUser(configData.mysql.user);
config.setMySQLPassword(configData.mysql.password);
export { config };
