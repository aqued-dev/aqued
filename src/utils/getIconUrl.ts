export const getIconUrl = (id: string, hash: null | string, firstInt?: number) => {
	if (hash) {
		const base = `https://cdn.discordapp.com/avatars/${id}`;
		if (hash.startsWith('a_')) {
			return `${base}/${hash}.gif`;
		} else {
			return `${base}/${hash}.png`;
		}
	} else {
		return `https://cdn.discordapp.com/embed/avatars/${firstInt}.png`;
	}
};
