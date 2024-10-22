import { pino } from 'pino';

export const Logger = pino({
	level: 'info',
	transport: {
		targets: [
			{
				target: 'pino/file',
				options: {
					destination: `logs/${Date.now()}.log`,
					mkdir: true,
				},
			},
			{ target: './LogSend.js' },
			{ target: 'pino-pretty', options: { colorize: true } },
		],
	},
});
