import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'FREE_CHANNEL' })
export class FreeChannel {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: '識別番号' })
	id: string;
	@Column({ name: 'category_id', type: 'bigint', comment: 'カテゴリID' })
	categoryId: string;
	@Column({ name: 'user_limit', type: 'text', comment: '1ユーザーのチャンネル数制限' })
	userLimit: string = '0000';
	@Column({ name: 'user_ids', type: 'simple-array', comment: '使用ユーザー達', nullable: true })
	userIds?: string[];
	constructor(id: string, categoryId: string) {
		this.id = id;
		this.categoryId = categoryId;
	}
}
