import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AUTO_PUBLISH' })
export class AutoPublish {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
}
