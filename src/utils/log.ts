export enum TextColors {
	Black = '\u001B[30m',
	Red = '\u001B[31m',
	Green = '\u001B[32m',
	Yellow = '\u001B[33m',
	Blue = '\u001B[34m',
	Magenta = '\u001B[35m',
	Cyan = '\u001B[36m',
	White = '\u001B[37m',
	Default = '\u001B[39m',
	Reset = '\u001B[0m',
}
export function success(text: string) {
	console.log(`${TextColors.Green}[success]${TextColors.Reset}: ${text}`);
}
export function error(text: string) {
	console.log(`${TextColors.Red}[error]${TextColors.Reset}: ${text}`);
}
export function pending(text: string) {
	console.log(`${TextColors.Magenta}[pending]${TextColors.Reset}: ${text}`);
}
export function info(text: string) {
	console.log(`${TextColors.Blue}[info]${TextColors.Reset}: ${text}`);
}
export function log(startColor: TextColors, prefixText: string, text: string) {
	console.log(`${startColor}[${prefixText}]${TextColors.Reset}: ${text}`);
}
