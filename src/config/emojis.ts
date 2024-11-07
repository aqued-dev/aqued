import { config } from './config.js';

const emojiData = {
	dev: {
		// 近日記述
		online: '',
		offline: '',
		idle: '',
		dnd: '',
		verifyMod: '',
		verifyBot: '',
		activeDev: '',
		botDev: '',
		nitro: '',
		boost: '',
		partner: '',
		bot: '',
		interaction: '',
		officialMod: '',
		HypesquadEvent: '',
		HypesquadBrilliance: '',
		HypesquadBravery: '',
		HypesquadBalance: '',
		earlySupporter: '',
		bugHanterLv2: '',
		bugHanter: ''
	},
	stable: {
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
export function emojis() {
	if (config.bot.stable) {
		return emojiData.stable;
	} else {
		return emojiData.dev;
	}
}
