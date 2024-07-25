import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'AI_THREAD_HISTORY' })
export class AiThreadHistory {
	@PrimaryColumn()
	@PrimaryGeneratedColumn('increment', { name: 'ID', type: 'int', comment: 'primary key' })
	id: number;
	@Column({ name: 'THREAD_ID', type: 'bigint', comment: 'スレッドID' })
	threadId: string;
	@Column({ name: 'USER_CONTENT', type: 'text', comment: 'ユーザーの言葉' })
	userContent: string;
	@Column({ name: 'AI_CONTENT', type: 'text', comment: 'AIの言葉' })
	aiContent: string;
}
