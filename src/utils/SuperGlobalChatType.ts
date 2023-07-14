export interface MessageData {
	type: 'message';
	version: string;
	userId: string;
	userName: string;
	userDiscriminator: string;
	userAvatar: string;
	isBot: boolean;
	guildId: string;
	guildName: string;
	guildIcon: string;
	channelId: string;
	channelName: string;
	messageId: string;
	content: string;
	reference?: string;
	attachmentsUrl?: string[];
}
export interface MessageDeleteData {
	type: 'delete';
	messageId: string;
}
export interface MessageEditData {
	type: 'edit';
	messageId: string;
	content: string;
}
export interface EmptyData {
	type: 'empty';
}
