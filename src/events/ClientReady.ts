import { ActivityType, Client, Colors, EmbedBuilder, Events } from 'discord.js';
import { info } from '../utils/log.js';

export default {
	name: Events.ClientReady,
	once: false,
	async execute(client: Client) {
		client.user.setPresence({
			status: 'online',
			activities: [
				{
					name: '/help | ' + client.guilds.cache.size + ' Guilds | v' + (await client.botData.infos.get('version')),
					type: ActivityType.Custom,
				},
			],
		});
		info(`Ready! Logged in as ${client.user.username}#${client.user.discriminator}.`);
		const logChannel = await client.channels.fetch(client.botData.botLogChannelId);
		if (!logChannel.isThread()) return;
		const users: string[] | undefined = await client.botData.commandExecutors.users.get('users');

		const commandExecNumber: Array<number | any> = await client.botData.commandExecutors.number.values();

		logChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Aquedが起動しました。')
					.setColor(Colors.Blue)
					.addFields(
						{ name: 'サーバー数', value: String(client.guilds.cache.size) ?? '不明' },
						{ name: 'ユーザー数', value: String(client.users.cache.size) ?? '不明' },
						{
							name: 'botを使用したことがあるユーザー数',
							value: users ? String(users.length) : '0',
						},
						{
							name: '総コマンド実行数',
							value: commandExecNumber.length > 0 ? commandExecNumber.reduce((a, b) => a + b, 0).toString() : '0',
						},
						{ name: 'バージョン', value: (await client.botData.infos.get('version')) ?? '不明' },
					),
			],
		});
		client.botData.reboot = false;
	},
};
