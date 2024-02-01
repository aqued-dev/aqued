import { Client, Events, GatewayIntentBits } from 'discord.js';
import { exit } from 'node:process';
import { config, logger } from './lib/index.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildPresences,
	],
	allowedMentions: { repliedUser: false, parse: [] },
	presence: { status: 'dnd' },
});
client.on(Events.Debug, (message) => logger.info(message));
await client
	.login(config.token)
	.then(() => logger.info('Login Success.'))
	.catch((error_) => {
		logger.error(error_);
		exit(1);
	});
