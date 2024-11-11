import type { UserFlagsBitField } from 'discord.js';
import { emojis } from '../config/emojis.js';

export function getFlags(flags: Readonly<UserFlagsBitField> | null) {
	if (!flags) {
		return 'なし';
	}
	const flag = flags.toArray();
	const emoji = emojis();
	const map = flag.map((value) =>
		value
			.replaceAll('VerifiedDeveloper', emoji.botDev)
			.replaceAll('PremiumEarlySupporter', emoji.earlySupporter)
			.replaceAll('ActiveDeveloper', emoji.activeDev)
			.replaceAll('Staff', emoji.officialMod)
			.replaceAll('Partner', emoji.partner)
			.replaceAll('Hypesquad', emoji.HypesquadEvent)
			.replaceAll('BugHunterLevel1', emoji.bugHanter)
			.replaceAll('BugHunterLevel2', emoji.bugHanterLv2)
			.replaceAll('HypeSquadOnlineHouse1', emoji.HypesquadBravery)
			.replaceAll('HypeSquadOnlineHouse2', emoji.HypesquadBrilliance)
			.replaceAll('HypeSquadOnlineHouse3', emoji.HypesquadBalance)
			.replaceAll('VerifiedBot', emoji.verifyBot)
			.replaceAll('CertifiedModerator', emoji.verifyMod)
	);
	return map.join(" ");
}
