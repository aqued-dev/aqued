import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'SUPER_GLOBAL_CHAT_DATA' })
export class SuperGlobalChatData {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'JSONのメッセージID' })
	id: string;
	@Column({ name: 'send_ids', type: 'simple-array', comment: '送信したメッセージIDら' })
	sendIds: string[];
	@Column({ name: 'edit_id', type: 'bigint', comment: '編集のJSONメッセージID', nullable: true })
	editId?: string;
	@Column({ name: 'delete_id', type: 'bigint', comment: '削除のJSONメッセージID', nullable: true })
	deleteId?: string;
	@Column({ name: 'reply_id', type: 'bigint', comment: '返信元のJSONメッセージID', nullable: true })
	replyId?: string;
	constructor(id: string, sendIds: string[]) {
		this.id = id;
		this.sendIds = sendIds;
	}
}
