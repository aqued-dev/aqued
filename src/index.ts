import { readdir } from 'node:fs/promises';
import { exit } from 'node:process';
import { inspect } from 'node:util';
import {
	ActivityType,
	Client,
	Collection,
	Colors,
	EmbedBuilder,
	GatewayIntentBits,
	REST,
	Routes,
	SnowflakeUtil,
} from 'discord.js';
import { SlashCommandBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';

import config from '../config.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };

import './utils/extrans.js';
import { info, error } from './utils/log.js';
import { MongoDB } from './utils/MongoDB.js';
function newMongoDB(name: string): MongoDB {
	return new MongoDB({ url: config.mongoDBUrl, name });
}
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildPresences,
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'dnd', activities: [{ name: '起動中...', type: ActivityType.Playing }] },
});
client.botData = {
	commands: { chatInput: [], userCotextMenu: [], messageCotextMenu: [] },
	interactionFiles: [],
	messageFiles: [],
	load: config.load,
	owners: config.owners,
	gbans: newMongoDB('botDataGbans'),
	mods: config.mods,
	reboot: true,
	cooldowns: new Collection(),
	errors: newMongoDB('botErrorData'),
	forcePin: newMongoDB('forcePin'),
	infos: newMongoDB('infos'),
	rolePanel: newMongoDB('rolePanel'),
	rolePanelId: newMongoDB('rolePanelId'),
	guildUpNotice: {
		dissoku: newMongoDB('guildUpNoticeDissoku'),
		disboard: newMongoDB('guildUpNoticeDisboard'),
	},
	aquedFreeChannel: newMongoDB('aquedFreeChannel'),
	aquedFreeChannelUser: newMongoDB('aquedFreeChannelUser'),
	commandExecutors: {
		serverUpNotice: newMongoDB('commandExecutorsServerUpNotice'),
		number: newMongoDB('commandExecutorsNumber'),
		users: newMongoDB('commandExecutorsUsers'),
	},
	globalChat: {
		register: newMongoDB('globalChatRegister'),
		messages: newMongoDB('globalChatMessages'),
		blocks: newMongoDB('globalChatblocks'),
	},
	superGlobalChat: {
		register: newMongoDB('superGlobalChatRegister'),
		messages: newMongoDB('superGlobalChatMessages'),
		replyMessages: newMongoDB('superGlobalReplyMessages'),
	},
	sgcJsonChannelId: config.sgcJsonChannelId,
	sgcJsonChannelIdv2: config.sgcJsonChannelIdv2,
	afk: { afk: newMongoDB('afk'), mention: newMongoDB('afkMention') },
	messageExpansion: newMongoDB('messageExpansion'),
	aquedAutoNews: newMongoDB('aquedAutoNews'),
	verifyPanel: newMongoDB('verifyPanel'),
	artifacter: newMongoDB('artifacter'),
	errorChannelId: config.channelIds.error,
	botLogChannelId: config.channelIds.botLog,
	commandLogChannelId: config.channelIds.commandLog,
	commandDatas: [],
	rest: new REST().setToken(config.token),
	clientId: config.clientId,
};
const {
	commands,
	infos,
	errorChannelId,
	interactionFiles,
	messageFiles,
	commandDatas,
	rest,
	clientId,
	errors,
	commandExecutors,
	load,
} = client.botData;
const version = packageJson.version;
const response = await fetch('https://api.github.com/repos/aqued-dev/aqued/tags');
if (response.ok) {
	const json = await response.json();
	if (Number(version.replaceAll('.', '')) < Number(json[0].name.replaceAll('.', ''))) {
		info('new version release: https://github.com/aqued-dev/aqued/releases/tag/' + json[0].name);
	} else if (Number(version.replaceAll('.', '')) === Number(json[0].name.replaceAll('.', ''))) {
		await infos.set('version', json[0].name);
	}
} else {
	await infos.set('version', version);
}

info('Aqued');
info('repository: https://github.com/aqued-dev/aqued');

info('Create By gx1285');
const users: string[] | undefined = await commandExecutors.users.get('users');
info(`Number of users using bot: ${users ? users.length : '0'}`);

const commandExecNumber: Array<number | any> = await commandExecutors.number.values();
info(
	`Total number of commands executed: ${
		commandExecNumber.length > 0 ? commandExecNumber.reduce((a, b) => a + b, 0).toString() : '0'
	}`,
);

info('********************');

info('Load a file');
if (load.chatinput) {
	for (const file of await readdir(`./dist/src/command/chatinput`).then((files) =>
		files.filter((file) => file.endsWith('.js')),
	)) {
		const { default: command } = await import(`./command/chatinput/${file}`);
		const commandData: SlashCommandBuilder | ContextMenuCommandBuilder = command.command;
		commands.chatInput.push({ name: commandData.name, data: command });
		commandDatas.push(commandData.toJSON());
	}
}
if (load.usercotextmenu) {
	for (const file of await readdir(`./dist/src/command/usercotextmenu`).then((files) =>
		files.filter((file) => file.endsWith('.js')),
	)) {
		const { default: command } = await import(`./command/usercotextmenu/${file}`);
		const commandData: SlashCommandBuilder | ContextMenuCommandBuilder = command.command;
		commands.userCotextMenu.push({ name: commandData.name, data: command });
		commandDatas.push(commandData.toJSON());
	}
}
if (load.messagecotextmenu) {
	for (const file of await readdir(`./dist/src/command/messagecotextmenu`).then((files) =>
		files.filter((file) => file.endsWith('.js')),
	)) {
		const { default: command } = await import(`./command/messagecotextmenu/${file}`);
		const commandData: SlashCommandBuilder | ContextMenuCommandBuilder = command.command;
		commands.messageCotextMenu.push({ name: commandData.name, data: command });
		commandDatas.push(commandData.toJSON());
	}
}
info('Loading of command is complete.');
for (const file of await readdir(`./dist/src/interactions`).then((files) =>
	files.filter((file) => file.endsWith('.js')),
)) {
	const { default: event } = await import(`./interactions/${file}`);
	interactionFiles.push(event);
}
for (const file of await readdir(`./dist/src/messages`).then((files) => files.filter((file) => file.endsWith('.js')))) {
	const { default: event } = await import(`./messages/${file}`);
	messageFiles.push(event);
}

for (const file of await readdir(`./dist/src/events`).then((files) => files.filter((file) => file.endsWith('.js')))) {
	const { default: event } = await import(`./events/${file}`);
	client[event.once ? 'once' : 'on'](event.name, async (...arguments_) => await event.execute(...arguments_));
}
info('File loading is complete.');

await rest
	.put(Routes.applicationCommands(clientId), {
		body: commandDatas,
	})
	.then(() => info('Command has been registered.'))
	.catch((error_) => {
		error(error_);
		error('Command could not be registered.');
		exit(1);
	});

await client
	.login(config.token)
	.then(() => info('Login Success.'))
	.catch((error_) => {
		error(error_);
		error('Login failed.');
		exit(1);
	});
process.on('uncaughtException', (error) => {
	console.error(error);
	const errorId = SnowflakeUtil.generate();
	errors.set(errorId.toString(), inspect(error).slice(0, 1800));

	client.channels.fetch(errorChannelId).then(async (channel) => {
		if (!channel.isTextBased()) return;
		channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(Colors.Red)
					.setTitle(':x: エラーが発生しました。')
					.setDescription('Id: ' + errorId.toString()),
			],
		});
	});
});
process.on('unhandledRejection', (error) => {
	console.error(error);
	const errorId = SnowflakeUtil.generate();
	errors.set(errorId.toString(), inspect(error).slice(0, 1800));

	client.channels.fetch(errorChannelId).then(async (channel) => {
		if (!channel.isTextBased()) return;
		channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(Colors.Red)
					.setTitle(':x: エラーが発生しました。')
					.setDescription('Id: ' + errorId.toString()),
			],
		});
	});
});
