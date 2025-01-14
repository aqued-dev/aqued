import { Events, Message, User } from 'discord.js';
import { setTimeout } from 'node:timers/promises';
import Afk from '../../../commands/chatInput/afk.js';
import { SettingManager } from '../../../core/SettingManager.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import type { AFKMentionData } from '../../../database/entities/UserSetting.js';
import { infoEmbed, successEmbed } from '../../../embeds/infosEmbed.js';
import { userFormat } from '../../../utils/userFormat.js';
export default class AFKonMessage implements EventListener<Events.MessageCreate> {
	public name: Events.MessageCreate;
	public once: boolean;
	constructor() {
		this.name = Events.MessageCreate;
		this.once = false;
	}
	async setMention(data: AFKMentionData) {
		const manager = new SettingManager({ userId: data.userId });
		const getData = await manager.getUser();
		if (!getData || (getData && !getData.afk)) {
			return { bool: false, data: null };
		}
		const mentions = getData.afkMentions ?? [];
		mentions.push(data);
		getData.afkMentions = mentions;
		await manager.updateUser(getData);
		return { bool: true, data: getData };
	}

	async mention(message: Message<true>) {
		const base = new AFKonMessage();
		if (message.mentions.repliedUser) {
			const user = message.mentions.repliedUser;
			await base.response(user, message);
		}
		if (message.mentions.parsedUsers.size === 0) {
			return;
		}

		for (const user of message.mentions.users.values()) {
			await base.response(user, message);
		}
	}
	async response(user: User, message: Message<true>) {
		const base = new AFKonMessage();
		const options: AFKMentionData = {
			userId: user.id,
			messageId: message.id,
			guildId: message.guildId,
			guildName: message.guild.name
		};
		if (message.channel.isThread()) {
			options.thread = { id: message.channel.id, name: message.channel.name };
			if (message.channel.parent) {
				options.channel = { id: message.channel.parent.id, name: message.channel.parent.name };
			}
		} else {
			options.channel = { id: message.channel.id, name: message.channel.name };
		}
		const afk = await base.setMention(options);
		if (afk.bool) {
			let reason = '理由: 未設定';
			if (afk.data && afk.data.afkReason) {
				reason = `理由: ${afk.data.afkReason}`;
			}
			const replyMessage = await message.reply({
				embeds: [
					infoEmbed(reason, `${userFormat(user)}はAFKです`).setFooter({ text: 'このメッセージは5秒後に削除されます' })
				]
			});
			await setTimeout(5000);
			if (replyMessage.deletable) {
				await replyMessage.delete();
			}
		}
	}
	async afk(message: Message<true>) {
		const manager = new SettingManager({ userId: message.author.id });
		const data = await manager.getUser();
		if (!data || !data.afk) {
			return;
		}
		await manager.updateUser({
			afk: false,
			afkReason: null,
			afkMentions: []
		});
		const base = new Afk();
		const replyMessage = await message.reply({
			embeds: [
				successEmbed('AFKを解除しました').setFooter({ text: 'このメッセージは5秒後に削除されます' }),
				base.mentionData(data.afkMentions ?? [])
			]
		});
		await setTimeout(5000);
		if (replyMessage.deletable) {
			await replyMessage.delete();
		}
	}
	async execute(message: Message) {
		if (message.author.bot || !message.inGuild()) {
			return;
		}
		const base = new AFKonMessage();
		await base.afk(message);
		await base.mention(message);
	}
}
