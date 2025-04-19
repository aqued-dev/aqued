import {
	CategoryChannel,
	Channel,
	Collection,
	DiscordAPIError,
	DMChannel,
	PartialDMChannel,
	PartialGroupDMChannel,
	StageChannel,
	ThreadChannel,
	Webhook,
	WebhookType,
} from 'discord.js';
import { fail, Result, success } from './Result.js';

// エラーステータス
export const WebhookError = {
	UnknownError: 0,
	PermissionError: 1,
	ParentChannel: 2,
} as const;

type WebhookErrorType = (typeof WebhookError)[keyof typeof WebhookError];

export async function getWebhook(
	baseChannel: Exclude<Channel, CategoryChannel | StageChannel | DMChannel | PartialDMChannel | PartialGroupDMChannel>,
): Promise<Result<Webhook<WebhookType.Incoming>, WebhookErrorType>> {
	if (baseChannel.isThread()) {
		if (!baseChannel.parent) {
			return fail(WebhookError.ParentChannel);
		}
		return await resolveWebhook(baseChannel.parent);
	}

	return await resolveWebhook(baseChannel);
}

const findWebhook = (webhooks: Collection<string, Webhook>, clientId: string) => {
	return webhooks.find((value) => {
		return (
			value.owner?.id === clientId ||
			value.applicationId === clientId ||
			!!value.token ||
			value.type === WebhookType.Incoming
		);
	}) as Webhook<WebhookType.Incoming> | undefined;
};

const createWebhook = async (
	channel: Exclude<Channel, DMChannel | CategoryChannel | PartialDMChannel | PartialGroupDMChannel | ThreadChannel>,
): Promise<Result<Webhook<WebhookType.Incoming>, WebhookErrorType>> => {
	try {
		const webhook = await channel.createWebhook({
			name: 'Aqued Webhook',
			reason: 'Aquedのウェブフックを使用する機能が使用されました',
		});
		return success(webhook);
	} catch (error) {
		if (error instanceof DiscordAPIError && error.status === 403) {
			return fail(WebhookError.PermissionError);
		}
		return fail(WebhookError.UnknownError);
	}
};

const resolveWebhook = async (
	channel: Exclude<
		Channel,
		CategoryChannel | StageChannel | DMChannel | PartialDMChannel | PartialGroupDMChannel | ThreadChannel
	>,
): Promise<Result<Webhook<WebhookType.Incoming>, WebhookErrorType>> => {
	const webhooks = await channel.fetchWebhooks();
	const webhook = findWebhook(webhooks, channel.client.user.id);

	if (webhook) return success(webhook);

	const created = await createWebhook(channel);
	return created;
};
