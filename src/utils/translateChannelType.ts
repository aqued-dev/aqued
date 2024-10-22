import { ChannelType } from 'discord.js';

export const translateChannelType = (flags: bigint[]): string[] => {
	const ChannelTypeNames: { [key in keyof typeof ChannelType]: string } = {
		GuildText: 'テキストチャンネル',
		DM: 'ダイレクトメッセージ',
		GuildVoice: 'ボイスチャンネル',
		GroupDM: 'グループDM',
		GuildCategory: 'カテゴリー',
		GuildAnnouncement: 'アナウンスチャンネル',
		AnnouncementThread: 'アナウンススレッド',
		PublicThread: '公開スレッド',
		PrivateThread: 'プライベートスレッド',
		GuildStageVoice: 'ステージチャンネル',
		GuildDirectory: 'Student Hub チャンネル',
		GuildForum: 'フォーラムチャンネル',
		GuildMedia: 'メディアチャンネル',
		GuildNews: 'アナウンスチャンネル',
		GuildNewsThread: 'アナウンススレッド',
		GuildPublicThread: '公開スレッド',
		GuildPrivateThread: 'プライベートスレッド',
	};
	const grantedTypes: string[] = [];
	flags.forEach((flag) => {
		for (const [key, value] of Object.entries(ChannelType)) {
			if (Number(flag) === value) {
				grantedTypes.push(ChannelTypeNames[key as keyof typeof ChannelType] || '不明なチャンネルの種類');
			}
		}
	});

	return grantedTypes.length > 0 ? grantedTypes : ['不明なチャンネルの種類'];
};
