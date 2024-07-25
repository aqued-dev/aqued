import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'EARTHQUAKE_ALERT' })
export class EarthQuakeAlert {
	@PrimaryColumn({ name: 'CHANNEL_ID', type: 'bigint', comment: 'チャンネルID' })
	channelId: string;
}