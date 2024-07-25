import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'AI_THREAD' })
export class AiThread {
	@PrimaryColumn({ name: 'THREAD_ID', type: 'bigint', comment: 'スレッドID' })
	threadId: string;
}