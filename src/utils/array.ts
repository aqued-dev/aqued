export const chunkArray = <T>(array: T[], size: number): T[][] => {
	if (array.length === 0) {
		return [];
	} else {
		return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
	}
};
