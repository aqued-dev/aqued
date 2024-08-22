/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/numeric-separators-style */
export function TanzakuGenerate(text: string): string {
	const replaceList = {
		ｶﾞ: 'ガ',
		ｷﾞ: 'ギ',
		ｸﾞ: 'グ',
		ｹﾞ: 'ゲ',
		ｺﾞ: 'ゴ',
		ｻﾞ: 'ザ',
		ｼﾞ: 'ジ',
		ｽﾞ: 'ズ',
		ｾﾞ: 'ゼ',
		ｿﾞ: 'ゾ',
		ﾀﾞ: 'ダ',
		ﾁﾞ: 'ヂ',
		ﾂﾞ: 'ヅ',
		ﾃﾞ: 'デ',
		ﾄﾞ: 'ド',
		ﾊﾞ: 'バ',
		ﾋﾞ: 'ビ',
		ﾌﾞ: 'ブ',
		ﾍﾞ: 'ベ',
		ﾎﾞ: 'ボ',
		ﾊﾟ: 'パ',
		ﾋﾟ: 'ピ',
		ﾌﾟ: 'プ',
		ﾍﾟ: 'ペ',
		ﾎﾟ: 'ポ',
		ｳﾞ: 'ヴ',
		ﾜﾞ: 'ヷ',
		ｦﾞ: 'ヺ',
		ｱ: 'ア',
		ｲ: 'イ',
		ｳ: 'ウ',
		ｴ: 'エ',
		ｵ: 'オ',
		ｶ: 'カ',
		ｷ: 'キ',
		ｸ: 'ク',
		ｹ: 'ケ',
		ｺ: 'コ',
		ｻ: 'サ',
		ｼ: 'シ',
		ｽ: 'ス',
		ｾ: 'セ',
		ｿ: 'ソ',
		ﾀ: 'タ',
		ﾁ: 'チ',
		ﾂ: 'ツ',
		ﾃ: 'テ',
		ﾄ: 'ト',
		ﾅ: 'ナ',
		ﾆ: 'ニ',
		ﾇ: 'ヌ',
		ﾈ: 'ネ',
		ﾉ: 'ノ',
		ﾊ: 'ハ',
		ﾋ: 'ヒ',
		ﾌ: 'フ',
		ﾍ: 'ヘ',
		ﾎ: 'ホ',
		ﾏ: 'マ',
		ﾐ: 'ミ',
		ﾑ: 'ム',
		ﾒ: 'メ',
		ﾓ: 'モ',
		ﾔ: 'ヤ',
		ﾕ: 'ユ',
		ﾖ: 'ヨ',
		ﾗ: 'ラ',
		ﾘ: 'リ',
		ﾙ: 'ル',
		ﾚ: 'レ',
		ﾛ: 'ロ',
		ﾜ: 'ワ',
		ｦ: 'ヲ',
		ﾝ: 'ン',
		ｧ: 'ァ',
		ｨ: 'ィ',
		ｩ: 'ゥ',
		ｪ: 'ェ',
		ｫ: 'ォ',
		ｯ: 'ッ',
		ｬ: 'ャ',
		ｭ: 'ュ',
		ｮ: 'ョ',
		'｡': '。',
		'､': '、',
		ｰ: 'ー',
		'｢': '「',
		'｣': '」',
		'･': '・',
	};
	let result: string;
	for (const [key, value] of Object.entries(replaceList)) {
		result = text.replaceAll(new RegExp(key, 'g'), value);
	}
	result = result.replaceAll(/[\dA-Za-z]/g, function (s) {
		return String.fromCodePoint(s.codePointAt(0) + 0xfee0);
	});

	return `┏┷┓\n${[...result].map((text) => `┃${text}┃\n`).join('')}┗━☆彡`;
}