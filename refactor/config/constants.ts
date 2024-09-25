export const constants = {
	webhookRegex: /https:\/\/(?:.+\.)?(?:discord\.com|discordapp\.com)\/api\/webhooks\/([^\\/]+)\/([^\\/]+)/,
	defaultConfigs: {
		bot: {
			id: '',
			admins: [],
			token: '',
			mods: [],
		},
		channels: { error: '', log: '', command: '' },
		mongo: { url: '', key: '' },
		loads: {
			chatInput: true,
			messageContextMenu: true,
			userContextMenu: true,
		},
		sgcJsonChannels: {
			v1: '',
			v2: '',
		},
		sgcJsonChannel: '',
		mysql: {
			host: 'db',
			port: 1644,
			user: 'user',
			password: 'password',
		},
		loggerWebhook: {
			id: '',
			token: '',
		},
		loggerThreadId: '',
	},
};
