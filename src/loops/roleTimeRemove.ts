import { Channel, Guild } from 'discord.js';
import { parentPort } from 'node:worker_threads';
import { BotData } from '../utils/extrans.js';

parentPort.on(
	'message',
	({ guilds, channels, botData }: { guilds: Guild[]; channels: Channel[]; botData: BotData }) => {
		setInterval(async () => {
			/*empty*/
		}, 1000);
	},
);
