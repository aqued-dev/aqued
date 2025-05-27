export const chunkArray = <T>(array: T[], size: number): T[][] => {
	if (array.length === 0) {
		return [];
	} else {
		return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
	}
};

export const choiceArray = <T>(arr: readonly T[]): T => {
	const index = Math.floor(Math.random() * arr.length);
	return arr[index];
};
