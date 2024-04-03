export function splitNewLineText(text: string): string[] {
	let texts: string[] = [];
	if (text.length > 1900) texts = text.split('\n');
	else texts.push(text);
	return texts;
}
