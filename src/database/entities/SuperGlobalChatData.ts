import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { SuperGlobalChatSendIds } from './SuperGlobalChatSendIds.js';

@Entity({ name: 'SUPER_GLOBAL_CHAT_DATA' })
export class SuperGlobalChatData {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'JSONのメッセージID' })
	id: string;

	@Column({ name: 'message_id', type: 'bigint', comment: '元メッセージのID' })
	messageId: string;

	@OneToMany(() => SuperGlobalChatSendIds, (sendId) => sendId.parentData, { cascade: true })
	sendIds!: SuperGlobalChatSendIds[];

	@Column({ name: 'edit_id', type: 'bigint', comment: '編集のJSONメッセージID', nullable: true })
	editId?: string;

	@Column({ name: 'delete_id', type: 'bigint', comment: '削除のJSONメッセージID', nullable: true })
	deleteId?: string;

	@Column({ name: 'reply_id', type: 'bigint', comment: '返信元のJSONメッセージID', nullable: true })
	replyId?: string;
	constructor(id: string, messageId: string, sendIds: { webhookUrl: string; messageId: string; channelId: string }[]) {
		this.id = id;
		this.messageId = messageId;
		if (sendIds && sendIds.length > 0) {
			this.sendIds = sendIds.map((s) => new SuperGlobalChatSendIds(s.webhookUrl, s.messageId, s.channelId, this));
		}
	}
}
