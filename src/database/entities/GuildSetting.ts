import { Column, Entity, PrimaryColumn } from 'typeorm';
export interface WelcomeMessageData {
	message: string;
	channelId: string;
}
@Entity({ name: 'GUILD_SETTING' })
export class GuildSetting {
	@PrimaryColumn({ name: 'GUILD_ID', type: 'bigint', comment: 'ギルドID' })
	guildId: string;
	@Column({ name: 'AUTO_MODS', type: 'simple-array', comment: 'Aquedにより設定されたAutoModのId配列', nullable: true })
	autoMods?: string[];
	@Column({ name: 'WELCOME_MESSAGE', type: 'json', comment: 'ウェルカムメッセージ', nullable: true })
	welcomeMessage?: WelcomeMessageData | null;
	@Column({ name: 'LEAVE_MESSAGE', type: 'json', comment: '退出メッセージ', nullable: true })
	LeaveMessage?: WelcomeMessageData | null;
	constructor(guildId: string) {
		this.guildId = guildId;
	}
}
