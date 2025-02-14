import configData from '../../config.json' with { type: 'json' };
import { constants } from './constants.js';

class Config {
	public bot: { id: string; admins: string[]; token: string; mods: string[]; stable: boolean } =
		constants.defaultConfigs.bot;
	public channels: { command: string } = constants.defaultConfigs.channels;
	public mongo: { url: string; key: string } = constants.defaultConfigs.mongo;
	public loads: { chatInput: boolean; messageContextMenu: boolean; userContextMenu: boolean } =
		constants.defaultConfigs.loads;
	public sgcJsonChannel: string = constants.defaultConfigs.sgcJsonChannel;
	public mysql: { host: string; port: number; user: string; password: string } = constants.defaultConfigs.mysql;
	public loggerWebhook: { id: string; token: string } = constants.defaultConfigs.loggerWebhook;
	public loggerThreadId: string = constants.defaultConfigs.loggerThreadId;
	public loggerGuildId: string = constants.defaultConfigs.loggerGuildId;

	setId(id: string) {
		this.bot.id = id;
	}
	setStable(stable: boolean) {
		this.bot.stable = stable;
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

	setCommandLogChannel(id: string) {
		this.channels.command = id;
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
	setSgcJsonChannel(channelId: string) {
		this.sgcJsonChannel = channelId;
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
	setLoggerUrl(webhookUrl: string) {
		const webhookSplit = webhookUrl.match(constants.webhookRegex);
		if (webhookSplit) {
			this.loggerWebhook = {
				id: webhookSplit[1] ?? '',
				token: webhookSplit[2] ?? ''
			};
		}
	}
	setLoggerGuildId(guildId: string) {
		this.loggerGuildId = guildId;
	}
	setLoggerThreadId(threadId: string) {
		this.loggerThreadId = threadId;
	}
}

const config = new Config();

config.setId(configData.clientId);
config.setToken(configData.token);
config.setAdmins(configData.owners);
config.setStable(configData.stable);
config.setMods(configData.mods);
config.setCommandLogChannel(configData.channelIds.commandLog);
config.setMongoUrl(configData.mongoDBUrl);
config.setMongoKey(configData.key);
config.setLoads({
	chatInput: configData.load.chatinput,
	messageContextMenu: configData.load.messagecotextmenu,
	userContextMenu: configData.load.usercotextmenu
});
config.setSgcJsonChannel(configData.sgcJsonChannelId);
config.setMySQLHost(configData.mysql.host);
config.setMySQLPort(configData.mysql.port);
config.setMySQLUser(configData.mysql.user);
config.setMySQLPassword(configData.mysql.password);
config.setLoggerUrl(configData.loggerUrl);
config.setLoggerGuildId(configData.loggerGuildId);
config.setLoggerThreadId(configData.loggerThreadId);
export { config };
