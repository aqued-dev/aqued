import { ChannelType, Events, GuildMember } from 'discord.js';
import { SettingManager } from '../../../core/SettingManager.js';
import type { EventListener } from '../../../core/types/EventListener.js';
import { getWebhook } from '../../../utils/getWebhook.js';
import { userFormat } from '../../../utils/userFormat.js';
import GlobalChatOnMessage from '../../globalChat/onMessage.js';
export default class WelcomeMessage implements EventListener<Events.GuildMemberAdd> {
	public name: Events.GuildMemberAdd;
	public once: boolean;
	constructor() {
		this.name = Events.GuildMemberAdd;
		this.once = false;
	}
	parser(message: string, member: GuildMember) {
		return message
			.replaceAll('{{server.name}}', member.guild.name)
			.replaceAll('{{member.name}}', member.user.displayName)
			.replaceAll('{{member.format_name}}', userFormat(member))
			.replaceAll('{{user.mention}}', `<@!${member.id}>`)
			.replaceAll('{{server.member_count}}', `${member.guild.memberCount}`);
	}
	async execute(member: GuildMember): Promise<unknown> {
		const manager = new SettingManager({ guildId: member.guild.id });
		const data = await manager.getGuild();
		if (!data) {
			return;
		}
		const setting = data.welcomeMessage;
		if (!setting) {
			return;
		}
		const channel = member.client.channels.cache.get(setting.channelId);
		if (
			!channel ||
			(channel && !channel.isSendable()) ||
			(channel && channel.isDMBased()) ||
			(channel && channel.type === ChannelType.GuildStageVoice)
		) {
			return;
		}
		const util = new GlobalChatOnMessage();
		const webhook = await getWebhook(channel);
		const embed = util.webhookErrorEmbed(webhook);

		if (embed) {
			return;
		}
		return await channel.send({ content: this.parser(setting.message, member) });
	}
}
