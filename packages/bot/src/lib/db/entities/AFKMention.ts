import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AFK_MENTIONS' })
export class AFKMentions {
	@PrimaryColumn({ name: 'USER_ID', type: 'bigint', comment: 'ユーザーID' })
	userId: string;
	@PrimaryColumn({ name: 'MESSAGE_ID', type: 'bigint', comment: 'メッセージID' })
	messageId: string;
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
	@PrimaryColumn({ name: 'GUILD_ID', type: 'bigint', comment: 'ギルドID' })
	guildId: string;
	@PrimaryColumn({ name: 'AFK_USERID', type: 'bigint', comment: 'AFK中のユーザーID' })
	afkUserId: string;
}
