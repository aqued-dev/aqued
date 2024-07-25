import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'AFK' })
export class AFK {
	@PrimaryColumn({ name: 'USER_ID', type: 'bigint', comment: 'ユーザーID' })
	userId: string;
	@Column({ name: 'REASON', type: 'text', comment: 'afkになった理由', nullable: true })
	reason?: string;
}
