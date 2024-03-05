import { pino } from 'pino';

export const Logger = pino({
	level: 'trace',
	transport: {
		target: 'pino-pretty',
	},
});
