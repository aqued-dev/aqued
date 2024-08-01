import { ChannelType, Message } from 'discord.js';
import { MessageEventClass } from '../../lib/index.js';
import { AutoPublish } from '../../lib/db/entities/AutoPublish.js';
import { dataSource } from '../../lib/db/dataSource.js';

export default class implements MessageEventClass {
	private async registered(channelId: string): Promise<{ bool: boolean; data: AutoPublish | undefined }> {
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(AutoPublish);
			const data = await repo.findOneBy({ channelId });

			if (!data) return { bool: false, data: undefined };
			return { bool: true, data };
		});
	}
	async run(message: Message) {
		if (!(await this.registered(message.channelId)).bool) return;
		if (message.author.system) return;
		if (message.channel.type !== ChannelType.GuildAnnouncement) return;
		if (message.crosspostable) {
			message.crosspost().then(() => message.react('✅'));
		} else {
			message.react('❌');
		}
	}
}
