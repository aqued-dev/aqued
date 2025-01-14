export function generateCustomId(
	type: 'chatinput' | 'components',
	component: 'modal' | 'button' | 'select',
	baseName: string,
	name: string,
	...args: string[]
) {
	let base = `${type}_${component}_${baseName}_${name}`;
	if (args) {
		base = base + `_${args.join('_')}`;
	}
	return base;
}
