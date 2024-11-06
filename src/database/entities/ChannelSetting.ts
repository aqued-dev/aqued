import type { AttachmentBuilder } from 'discord.js';
import { Column, Entity, PrimaryColumn } from 'typeorm';
interface ForcePin {
	attachments: AttachmentBuilder[];
	userId: string;
	content: string;
	latestMessageId: string;
}
@Entity({ name: 'CHANNEL_SETTING' })
export class ChannelSetting {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
	@Column({ name: 'GLOBAL_CHAT', type: 'boolean', comment: 'グローバルチャット参加の有無', nullable: true })
	globalChat?: boolean | null;
	@Column({ name: 'FORCE_PIN', type: 'json', comment: 'メッセージを下に固定', nullable: true })
	forcePin?: ForcePin | null;

	constructor(channelId: string) {
		this.channelId = channelId;
	}
}
