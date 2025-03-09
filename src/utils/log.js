'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.TextColors = void 0;
exports.success = success;
exports.error = error;
exports.pending = pending;
exports.info = info;
exports.log = log;
var TextColors;
(function (TextColors) {
	TextColors['Black'] = '\u001B[30m';
	TextColors['Red'] = '\u001B[31m';
	TextColors['Green'] = '\u001B[32m';
	TextColors['Yellow'] = '\u001B[33m';
	TextColors['Blue'] = '\u001B[34m';
	TextColors['Magenta'] = '\u001B[35m';
	TextColors['Cyan'] = '\u001B[36m';
	TextColors['White'] = '\u001B[37m';
	TextColors['Default'] = '\u001B[39m';
	TextColors['Reset'] = '\u001B[0m';
})(TextColors || (exports.TextColors = TextColors = {}));
function success(text) {
	console.log(''.concat(TextColors.Green, '[success]').concat(TextColors.Reset, ': ').concat(text));
}
function error(text) {
	console.log(''.concat(TextColors.Red, '[error]').concat(TextColors.Reset, ': ').concat(text));
}
function pending(text) {
	console.log(''.concat(TextColors.Magenta, '[pending]').concat(TextColors.Reset, ': ').concat(text));
}
function info(text) {
	console.log(''.concat(TextColors.Blue, '[info]').concat(TextColors.Reset, ': ').concat(text));
}
function log(startColor, prefixText, text) {
	console.log(''.concat(startColor, '[').concat(prefixText, ']').concat(TextColors.Reset, ': ').concat(text));
}
