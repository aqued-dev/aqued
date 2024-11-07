import packageJson from '../../package.json' with { type: 'json' };
export const constants = {
	version: packageJson.version,
	webhookRegex: /https:\/\/(?:.+\.)?(?:discord\.com|discordapp\.com)\/api\/webhooks\/([^\\/]+)\/([^\\/]+)/,
	defaultConfigs: {
		bot: {
			id: '',
			admins: [],
			token: '',
			mods: [],
			stable: false
		},
		channels: { error: '', log: '', command: '' },
		mongo: { url: '', key: '' },
		loads: {
			chatInput: true,
			messageContextMenu: true,
			userContextMenu: true
		},
		sgcJsonChannels: {
			v1: '',
			v2: ''
		},
		sgcJsonChannel: '',
		mysql: {
			host: 'db',
			port: 1644,
			user: 'user',
			password: 'password'
		},
		loggerWebhook: {
			id: '',
			token: ''
		},
		loggerThreadId: ''
	},
	regexs: {
		inviteUrls: {
			dissoku: /dissoku\.net/g,
			disboard: /disboard\.org/g,
			discoparty: /discoparty\.jp/g,
			discordApp: /discordapp\.com\/invite\/(?<code>[\w-]*)/gi,
			discord: /discord\.com\/invite\/(?<code>[\w-]*)/gi,
			discordGg: /discord\.gg\/(?<code>[\w-]*)/gi,
			discordCafe: /discordcafe\.app/g,
			dicoall: /dicoall\.com/g,
			sabach: /sabach\.jp/g
		},
		mention: /@everyone|@here/,
		discordToken: /^(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})$/gm,
		email: /[^@\s]+@[^@\s]+\.[^@\s]+/
	}
};
