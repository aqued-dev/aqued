import {
	Attachment,
	CDN,
	Collection,
	Colors,
	EmbedBuilder,
	Sticker,
	StickerFormatType,
	User,
	WebhookMessageCreateOptions,
} from 'discord.js';
import { defaultAvatarUrl, multiCalculateUserDefaultAvatarIndex } from '../utils/defaultUserAvatar.js';
import { SimpleUser, userFormat } from '../utils/userFormat.js';

export function animatedIconByHash(hash: string) {
	return hash.startsWith('a_');
}

export async function makeMessageObject(
	cdn: CDN = new CDN(),
	iconHash: string | null,
	user: User | SimpleUser,
	cleanContent: string,
	stickers?: Collection<string, Sticker>,
	attachments?: Collection<string, Attachment>,
) {
	const messageObject: WebhookMessageCreateOptions = {};
	const sticker = stickers?.first();
	const embeds = [];
	let content: string = cleanContent;
	const splitContent = content.slice(0, 1900);

	if (sticker && sticker?.format !== StickerFormatType.Lottie) {
		embeds.push(new EmbedBuilder().setTitle('ステッカー').setColor(Colors.Blue).setImage(sticker.url));
	}

	if (content !== splitContent) {
		content = `${splitContent}...(メッセージ省略)`;
	}

	if (iconHash) {
		const animatedIcon = animatedIconByHash(iconHash);
		messageObject.avatarURL = cdn.avatar(user.id, iconHash, { extension: animatedIcon ? 'gif' : 'webp' });
	} else {
		messageObject.avatarURL = defaultAvatarUrl(multiCalculateUserDefaultAvatarIndex(user.id, user.discriminator));
	}
	messageObject.username = userFormat(user);
	messageObject.content = content;
	messageObject.embeds = embeds;
	messageObject.files = Array.from(attachments?.values() ?? []);

	return messageObject;
}
