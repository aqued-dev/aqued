import { Message } from 'discord.js';
import { AFK } from '../../lib/db/entities/AFK.js';
import { dataSource } from '../../lib/db/dataSource.js';
import { AFKMentions } from '../../lib/db/entities/AFKMention.js';
import { MessageEventClass, Logger } from '../../lib/index.js';

export default class implements MessageEventClass {
	private message: Message;
	private async getAfkData(): Promise<AFK | undefined> {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AFK);
			const data = await repo.findOneBy({ userId: this.message.author.id });
			return data ?? undefined;
		});
	}
	private async afkRegistered(): Promise<boolean> {
		const data = await this.getAfkData();
		if (!data) return false;
		return true;
	}
	private async mentionRegister() {
		dataSource.transaction(async (em) => {
			const repo = em.getRepository(AFKMentions);
			const data = await this.getAfkData();
			const afkMention = new AFKMentions();
			afkMention.afkUserId = data.userId;
			afkMention.channelId = this.message.channelId;
			afkMention.guildId = this.message.guildId;
			afkMention.messageId = this.message.id;
			afkMention.userId = this.message.author.id;
			await repo.insert(afkMention);
		});
	}
	async run(message: Message) {
		this.message = message;
		if (!this.message.reference) return;
		const registered = await this.afkRegistered();
		if (!registered) return;
		await this.mentionRegister();
	}
}
