export const constants = {
	webhookRegex: /https:\/\/(?:.+\.)?(?:discord\.com|discordapp\.com)\/api\/webhooks\/([^\\/]+)\/([^\\/]+)/,
	defaultConfigs: {
		bot: {
			id: '',
			admins: [],
			token: '',
			mods: []
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
			discord: /(https?:\/\/)?(www\.)?(discord\.(gg|com|net)|discordapp\.(com|net)\/invite)\/[\dA-Za-z]+/g,
			discordCafe: /discordcafe\.app/g,
			dicoall: /dicoall\.com/g,
			sabach: /sabach\.jp/g
		},
		mention: /@everyone|@here/,
		discordToken: /^(mfa\.[a-z0-9_-]{20,})|([a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})$/gm,
		email: /[^@\s]+@[^@\s]+\.[^@\s]+/
	}
};