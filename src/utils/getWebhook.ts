import {
	CategoryChannel,
	Collection,
	DiscordAPIError,
	DMChannel,
	PartialGroupDMChannel,
	StageChannel,
	ThreadChannel,
	Webhook,
	WebhookType,
	type Channel,
	type PartialDMChannel
} from 'discord.js';
import { Logger } from '../core/Logger.js';
export enum WebhookStatus {
	UnknownError = 0,
	PermissionError = 1,
	ParentChannel = 2
}

export async function getWebhook(
	baseChannel: Exclude<Channel, CategoryChannel | StageChannel | DMChannel | PartialDMChannel | PartialGroupDMChannel>
): Promise<Webhook<WebhookType.Incoming> | WebhookStatus> {
	const channel = baseChannel;

	const createWebhook = async (
		targetChannel: Exclude<
			Channel,
			DMChannel | CategoryChannel | PartialDMChannel | PartialGroupDMChannel | ThreadChannel
		>
	) => {
		try {
			return await targetChannel.createWebhook({
				name: 'Aqued Webhook',
				reason: 'Aquedのウェブフックを使用する機能が使用されました'
			});
		} catch (error) {
			if (error instanceof DiscordAPIError && error.status === 403) {
				return WebhookStatus.PermissionError;
			}
			Logger.error(error);
			return WebhookStatus.UnknownError;
		}
	};

	const findWebhook = (webhooks: Collection<string, Webhook>, clientId: string) => {
		return webhooks.find((value) => {
			return value.owner?.id === clientId || value.applicationId === clientId || !!value.token;
		});
	};

	if (channel.isThread()) {
		if (!channel.parent) {
			return WebhookStatus.ParentChannel;
		}
		const webhooks = await channel.parent.fetchWebhooks();
		if (webhooks.size === 0) {
			return await createWebhook(channel.parent);
		}
		const webhook = findWebhook(webhooks, channel.client.user.id);
		return (webhook as Webhook<WebhookType.Incoming>) ?? (await createWebhook(channel.parent));
	}

	const webhooks = await channel.fetchWebhooks();
	if (webhooks.size === 0) {
		return await createWebhook(channel);
	}
	const webhook = findWebhook(webhooks, channel.client.user.id);
	return (webhook as Webhook<WebhookType.Incoming>) ?? (await createWebhook(channel));
}
