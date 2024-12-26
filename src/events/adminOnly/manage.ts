import { Events, Message } from 'discord.js';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { EventListener } from '../../core/types/EventListener.js';
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
					const errorId = errorReport(
						fileURLToPath(import.meta.url),
						message.channel,
						message.author,
						error,
						'aq.sync'
					);
					wait.edit('Error...\nId: ' + errorId);
				}
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
					const errorId = errorReport(fileURLToPath(import.meta.url), message.channel, message.author, error, 'aq.re');
					wait.edit('Error...\nId: ' + errorId);
				}
			}
		}
	}
}
