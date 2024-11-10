import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface AFKMentionData {
	userId: string;
	messageId: string;
	guildId: string;
	guildName: string;
	channel?: {
		id: string;
		name: string;
	};
	thread?: {
		id: string;
		name: string;
	};
}
@Entity({ name: 'USER_SETTING' })
export class UserSetting {
	@PrimaryColumn({ name: 'USER_ID', type: 'bigint', comment: 'ユーザーID' })
	userId: string;
	@Column({ name: 'AFK', type: 'boolean', comment: 'afkであるか', nullable: true })
	afk?: boolean;
	@Column({ name: 'AFK_REASON', type: 'text', comment: 'afkである理由', nullable: true })
	afkReason?: string | null;
	@Column({ name: 'AFK_MENTIONS', type: 'json', comment: 'afkメンションデータ', nullable: true })
	afkMentions?: AFKMentionData[];

	constructor(userId: string) {
		this.userId = userId;
	}
}
