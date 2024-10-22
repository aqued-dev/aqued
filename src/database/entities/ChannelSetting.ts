import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'CHANNEL_SETTING' })
export class ChannelSetting {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
	@Column({ name: 'GLOBAL_CHAT', type: 'boolean', comment: 'グローバルチャット参加の有無', nullable: true })
	globalChat?: boolean;

	constructor(channelId: string) {
		this.channelId = channelId;
	}
}
