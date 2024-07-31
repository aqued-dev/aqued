import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AI' })
export class Ai {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
}
