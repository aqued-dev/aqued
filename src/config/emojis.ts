import { config } from './config.js';
export interface EmojiData {
	check: string;
	warn: string;
	reply: string;
	no: string;
	info: string;
	delete: string;
	online: string;
	offline: string;
	idle: string;
	dnd: string;
	verifyMod: string;
	verifyBot: string;
	activeDev: string;
	botDev: string;
	nitro: string;
	boost: string;
	partner: string;
	bot: string;
	interaction: string;
	officialMod: string;
	HypesquadEvent: string;
	HypesquadBrilliance: string;
	HypesquadBravery: string;
	HypesquadBalance: string;
	earlySupporter: string;
	bugHanterLv2: string;
	bugHanter: string;
}
const emojiData: { dev: EmojiData; stable: EmojiData } = {
	dev: {
		check: '<:check:1294246167416275037>',
		warn: '<:warn:1298214735078228040>',
		reply: '<:reply:1298249673534079008>',
		no: '<:no:1298214713221447721>',
		info: '<:info:1298214751645601792>',
		delete: '<:delete:1298550464836800565>',
		online: '<:online:1304624568715055145>',
		offline: '<:offline:1304624625250078780>',
		idle: '<:idle:1304624605733851217>',
		dnd: '<:dnd:1304624585962033172>',
		verifyMod: '<:verify_mod:1304624649493151784>',
		verifyBot: '<:verify:1304624687984410695>',
		activeDev: '<:active_dev:1304624670569664512>',
		botDev: '<:bot_verify:1304624766455648356>',
		nitro: '<:nitro:1304624798013460492>',
		boost: '<:boost:1304624736646598729>',
		partner: '<:partner:1304624892141899857>',
		bot: '<:bot:1304624843777376347>',
		interaction: '<:interaction:1304624917916024965>',
		officialMod: '<:mod:1304624941399806023>',
		HypesquadEvent: '<:event:1304625069749964923>',
		HypesquadBrilliance: '<:brilliance:1304624995410116698>',
		HypesquadBravery: '<:bravery:1304624963507982438>',
		HypesquadBalance: '<:balance:1304625096752762880>',
		earlySupporter: '<:supporter:1304625149839933553>',
		bugHanterLv2: '<:bug_lv2:1304625130164588564>',
		bugHanter: '<:bug:1304625167263072287>'
	},
	stable: {
		check: '<:check:1304621806069612625>',
		warn: '<:warn:1304621664494948433>',
		reply: '<:reply:1304621652407095387>',
		no: '<:no:1304621639266467932>',
		info: '<:info:1304621622778662932>',
		delete: '<:delete:1304621606747897878>',
		online: '<:online:1304074555211649034>',
		offline: '<:offline:1304074530851000371>',
		idle: '<:idle:1304074506121379857>',
		dnd: '<:dnd:1304074473116536974>',
		verifyMod: '<:verify_mod:1304074439377555476>',
		verifyBot: '<:verify:1304074375078871072>',
		activeDev: '<:active_dev:1304074352425435176>',
		botDev: '<:bot_verify:1304074329453101078>',
		nitro: '<:nitro:1304074298033705021>',
		boost: '<:boost:1304074274872758373>',
		partner: '<:partner:1304074240017961002>',
		bot: '<:bot:1304074183428411425>',
		interaction: '<:interaction:1304074113513685022>',
		officialMod: '<:mod:1304074066730287174>',
		HypesquadEvent: '<:event:1304074047705059408>',
		HypesquadBrilliance: '<:brilliance:1304074031552659486>',
		HypesquadBravery: '<:bravery:1304074014272127018>',
		HypesquadBalance: '<:balance:1304073992465944619>',
		earlySupporter: '<:supporter:1304073527292465163>',
		bugHanterLv2: '<:bug_lv2:1304073510666244168>',
		bugHanter: '<:bug:1304073480215466004>'
	}
};
export function emojis(): EmojiData {
	if (config.bot.stable) {
		return emojiData.stable;
	} else {
		return emojiData.dev;
	}
}
