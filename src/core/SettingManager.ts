import { ChannelSetting } from '../database/entities/ChannelSetting.js';
import { GuildSetting } from '../database/entities/GuildSetting.js';
import { UserSetting } from '../database/entities/UserSetting.js';
import { dataSource } from './typeorm.config.js';
interface Ids {
	channelId?: string;
	guildId?: string;
	userId?: string;
}
export class SettingManager {
	ids: Ids;
	constructor(ids: Ids) {
		this.ids = ids;
	}

	async getGuild() {
		const guildId = this.ids.guildId;
		if (!guildId) {
			return;
		}
		const repo = dataSource.getRepository(GuildSetting);
		const guildSetting = await repo.findOne({ where: { guildId: guildId } });
		return guildSetting;
	}
	async getChannel() {
		const channelId = this.ids.channelId;
		if (!channelId) {
			return;
		}
		const repo = dataSource.getRepository(ChannelSetting);
		const channelSetting = await repo.findOne({ where: { channelId: channelId } });
		return channelSetting;
	}
	async getUser() {
		const userId = this.ids.userId;
		if (!userId) {
			return;
		}
		const repo = dataSource.getRepository(UserSetting);
		const guildSetting = await repo.findOne({ where: { userId: userId } });
		return guildSetting;
	}
	async updateGuild(updated: Partial<GuildSetting>) {
		const guildId = this.ids.guildId;
		if (!guildId) {
			return;
		}
		let guildSetting = await this.getGuild();
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(GuildSetting);
			if (!guildSetting) {
				guildSetting = new GuildSetting(guildId);
			}
			Object.assign(guildSetting, updated);
			await repo.save(guildSetting);
			return guildSetting;
		});
	}
	async updateChannel(updated: Partial<ChannelSetting>) {
		const channelId = this.ids.channelId;
		if (!channelId) {
			return;
		}
		let channelSetting = await this.getChannel();
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(ChannelSetting);
			if (!channelSetting) {
				channelSetting = new ChannelSetting(channelId);
			}
			Object.assign(channelSetting, updated);
			await repo.save(channelSetting);
			return channelSetting;
		});
	}
	async updateUser(updated: Partial<UserSetting>) {
		const userId = this.ids.userId;
		if (!userId) {
			return;
		}
		let userSetting = await this.getUser();
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(UserSetting);
			if (!userSetting) {
				userSetting = new UserSetting(userId);
			}
			Object.assign(userSetting, updated);
			await repo.save(userSetting);
			return userSetting;
		});
	}
}
