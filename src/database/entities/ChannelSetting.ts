import type { AttachmentBuilder } from 'discord.js';
import { Column, Entity, PrimaryColumn } from 'typeorm';
interface ForcePin {
	attachments: AttachmentBuilder[];
	userId: string;
	content: string;
	latestMessageId: string;
}
interface MessageExpander {
	inviteReplace: boolean;
	useInThread: boolean;
}
@Entity({ name: 'CHANNEL_SETTING' })
export class ChannelSetting {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
	@Column({ name: 'GLOBAL_CHAT', type: 'boolean', comment: 'グローバルチャット参加の有無', nullable: true })
	globalChat?: boolean | null;
	@Column({ name: 'SUPER_GLOBAL', type: 'boolean', comment: 'スーパーグローバルチャット参加の有無', nullable: true })
	superGlobal?: boolean | null;
	@Column({ name: 'AUTO_NEWS', type: 'boolean', comment: 'ニュース自動公開の有無', nullable: true })
	autoNews?: boolean | null;
	@Column({ name: 'FORCE_PIN', type: 'json', comment: 'メッセージを下に固定', nullable: true })
	forcePin?: ForcePin | null;
	@Column({ name: 'MESSAGE_EXPANDER', type: 'json', comment: 'メッセージ展開の設定', nullable: true })
	messageExpander?: MessageExpander | null;
	constructor(channelId: string) {
		this.channelId = channelId;
	}
}
