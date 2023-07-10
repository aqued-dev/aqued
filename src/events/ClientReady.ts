import { ActivityType, Client, Colors, EmbedBuilder, Events } from 'discord.js';
import { info } from '../utils/log.js';
import { readdir, stat, unlink } from 'node:fs/promises';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		const files = await readdir('src/interactions/artifacter');
		for (const file of files) {
			const filePath = `src/interactions/artifacter/${file}`;
			const fileExtension = file.split('.').pop();
			// eslint-disable-next-line unicorn/no-await-expression-member
			if ((await stat(filePath)).isFile() && fileExtension === 'png') {
				await unlink(filePath);
			}
		}

		client.user.setPresence({
			status: 'online',
			activities: [
				{
					name: '/help | ' + client.guilds.cache.size + ' Guilds | v' + (await client.botData.infos.get('version')),
					type: ActivityType.Playing,
				},
			],
		});
		info(`Ready! Logged in as ${client.user.username}#${client.user.discriminator}.`);
		const logChannel = client.channels.cache.get(client.botData.botLogChannelId);
		if (!logChannel.isThread()) return;
		const users: string[] | undefined = await client.botData.commandExecutors.users.get('users');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const commandExecNumber: Array<number | any> = await client.botData.commandExecutors.number.values();

		logChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle('Aquedが起動しました。')
					.setColor(Colors.Blue)
					.addFields(
						{ name: 'サーバー数', value: String(client.guilds.cache.size) },
						{ name: 'ユーザー数', value: String(client.users.cache.size) },
						{
							name: 'botを使用したことがあるユーザー数',
							value: users ? String(users.length) : '0',
						},
						{
							name: '総コマンド実行数',
							value: commandExecNumber.length > 0 ? commandExecNumber.reduce((a, b) => a + b, 0).toString() : '0',
						},
						{ name: 'バージョン', value: await client.botData.infos.get('version') },
					),
			],
		});
		client.botData.reboot = false;
	},
};
