import { inspect } from 'node:util';
import { client } from './core/client.js';
import { Logger } from './core/Logger.js';
process.on('uncaughtException', (error) => Logger.error(inspect(error)));
process.on('unhandledRejection', (error) => Logger.error(inspect(error)));
await client
	.login()
	.then(() => Logger.info('Logging in'))
	.catch((reason) => Logger.error(reason));
