import { AttachmentBuilder, WebhookClient } from 'discord.js';
import build from 'pino-abstract-transport';
import { config } from '../config/config.js';
const threadId = config.loggerThreadId;
export default async function () {
	return build(async function (source) {
		source.on('data', async (obj: { level: number; time: number; pid: number; hostname: string; msg: string }) => {
			const webhook = new WebhookClient(config.loggerWebhook);
			const logMessage = '```pwsh\n' + obj.msg + '\n```';
			if (logMessage.length > 1500) {
				const attachment = new AttachmentBuilder(Buffer.from(logMessage)).setName('log.js');
				await webhook.send({ threadId, files: [attachment] });
			} else {
				await webhook.send({ threadId, content: '```pwsh\n' + obj.msg + '\n```' });
			}
		});
	});
}
