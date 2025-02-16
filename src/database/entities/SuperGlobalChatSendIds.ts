import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SuperGlobalChatData } from './SuperGlobalChatData.js';

@Entity({ name: 'SUPER_GLOBAL_CHAT_SEND_IDS' })
export class SuperGlobalChatSendIds {
	@Column({ name: 'webhook_url', type: 'text', comment: '送信に使用したWebhook URL' })
	webhookUrl: string;

	@Column({ name: 'channel_id', type: 'bigint', comment: 'Webhook URLが削除された場合の作成元チャンネル' })
	channelId: string;

	@PrimaryColumn({ name: 'message_id', type: 'bigint', comment: '送信済みメッセージID' })
	messageId: string;

	@ManyToOne(() => SuperGlobalChatData, (parent) => parent.sendIds, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'parent_data' })
	parentData: SuperGlobalChatData;

	constructor(webhookUrl: string, messageId: string, channelId: string, parentData: SuperGlobalChatData) {
		this.webhookUrl = webhookUrl;
		this.messageId = messageId;
		this.parentData = parentData;
		this.channelId = channelId;
	}
}
