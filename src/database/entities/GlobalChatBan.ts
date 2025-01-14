import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'GLOBAL_CHAT_BAN' })
export class GlobalChatBan {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'ユーザーID' })
	id: string;

	@Column({ name: 'reason', type: 'text', comment: '理由' })
	reason: string;

	constructor(id: string, reason: string) {
		this.id = id;
		this.reason = reason;
	}
}
