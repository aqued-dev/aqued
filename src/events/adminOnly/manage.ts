import { Events, Message } from 'discord.js';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { emojis } from '../../config/emojis.js';
import { dataSource } from '../../core/typeorm.config.js';
import type { EventListener } from '../../core/types/EventListener.js';
import { Error } from '../../database/entities/Error.js';
import { errorReport } from '../../utils/errorReporter.js';
export default class MessageCreate implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async execute(message: Message) {
		if (message.client.aqued.config.bot.admins.includes(message.author.id)) {
			if (message.content === 'aq.sync') {
				const wait = await message.reply('Wait...');
				try {
					const data = await promisify(exec)('git pull');
					wait.edit('Success!\n```\n' + data.stdout + '\n```');
				} catch (error) {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						message.channel,
						message.author,
						error,
						'aq.sync'
					);
					wait.edit('Error...\nId: ' + errorId);
				}
				return;
			} else if (message.content === 'aq.re') {
				const wait = await message.reply('Wait(1/3)...');
				try {
					await promisify(exec)('pnpm build');
					await Promise.all([
						wait.edit('Wait(2/3)...'),
						await message.client.aqued.events.reloadAllEvents(),
						wait.edit('Wait(3/3)...'),
						await message.client.aqued.commands.reloadAllCommands(),
						wait.edit('Reloaded!')
					]);
				} catch (error) {
					const errorId = await errorReport(
						fileURLToPath(import.meta.url),
						message.channel,
						message.author,
						error,
						'aq.re'
					);
					wait.edit('Error...\nId: ' + errorId);
				}
				return;
			} else if (message.content.startsWith('aq.error')) {
				const id = message.content.replace('aq.error ', '');
				if (!id) {
					return await message.react(emojis().no);
				} else {
					return dataSource.transaction(async (em) => {
						const repo = em.getRepository(Error);
						const data = await repo.findOne({ where: { id } });
						if (!data) {
							return await message.react(emojis().no);
						} else {
							return await message.reply(data.url);
						}
					});
				}
			} else {
				return;
			}
		} else {
			return;
		}
	}
}
