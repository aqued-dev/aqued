import { Column, Entity, PrimaryColumn } from 'typeorm';
export interface GlobalChatMessages {
	messageId: string;
	channelId: string;
	webhookUrl: string;
}
@Entity({ name: 'GLOBAL_CHAT_MESSAGE' })
export class GlobalChatMessage {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'メッセージID' })
	id: string;
	@PrimaryColumn({ name: 'channelId', type: 'bigint', comment: '送信チャンネルID' })
	channelId: string;
	@PrimaryColumn({ name: 'guildId', type: 'bigint', comment: '送信ギルドID' })
	guildId: string;
	@Column({ name: 'messages', type: 'json', comment: '送信済みメッセージ' })
	messages: GlobalChatMessages[];
	constructor(id: string, channelId: string, guildId: string, messages: GlobalChatMessages[]) {
		this.id = id;
		this.channelId = channelId;
		this.guildId = guildId;
		this.messages = messages;
	}
}
