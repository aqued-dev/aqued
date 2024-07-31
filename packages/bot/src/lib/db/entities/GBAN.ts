import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'GBAN' })
export class GBAN {
	@PrimaryColumn({ name: 'USER_ID', type: 'bigint', comment: 'ユーザーID' })
	userId: string;
	@Column({ name: 'REASON', type: 'text', comment: '理由' })
	reason: string;
}
