import { dataSource } from '../core/typeorm.config.js';
import { GuildSetting } from '../database/entities/GuildSetting.js';

export class GuildSettingManager {
	guildId: string;
	constructor(guildId: string) {
		this.guildId = guildId;
	}
	async getSetting() {
		const repo = dataSource.getRepository(GuildSetting);
		const guildSetting = await repo.findOne({ where: { guildId: this.guildId } });
		return guildSetting;
	}

	async setSetting(updated: Partial<GuildSetting>) {
		let guildSetting = await this.getSetting();
		return dataSource.transaction(async (em) => {
			const repo = em.getRepository(GuildSetting);
			if (!guildSetting) guildSetting = new GuildSetting(this.guildId);
			Object.assign(guildSetting, updated);
			await repo.save(guildSetting);
			return guildSetting;
		});
	}
}
