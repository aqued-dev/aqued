const regexs = {
	dissoku: /dissoku\.net/g,
	disboard: /disboard\.org/g,
	discoparty: /discoparty\.jp/g,
	discordApp: /discordapp\.com\/invite\/(?<code>[\w-]*)/gi,
	discord: /discord\.com\/invite\/(?<code>[\w-]*)/gi,
	discordGg: /discord\.gg\/(?<code>[\w-]*)/gi,
	discordCafe: /discordcafe\.app/g,
	dicoall: /dicoall\.com/g,
	sabach: /sabach\.jp/g,
	distopia: /distopia\.top/g,
};

export const inviteUrlHas = (text: string) => {
	for (const regex of Object.values(regexs)) {
		const test = regex.test(text);
		if (test) {
			return true;
		}
	}
	return false;
};
