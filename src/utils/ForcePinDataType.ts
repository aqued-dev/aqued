import { APIEmbed, AttachmentBuilder } from 'discord.js';

export interface ForcePinDataType {
	attachments: (string | AttachmentBuilder)[];
	embeds: APIEmbed[];
	userId: string;
	content: string;
	latestMessageId: string;
	latestChannelId: string;
}
