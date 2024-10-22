import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'GUILD_SETTING' })
export class GuildSetting {
	@PrimaryColumn({ name: 'GUILD_ID', type: 'bigint', comment: 'ギルドID' })
	guildId: string;
	@Column({ name: 'AUTO_MODS', type: 'simple-array', comment: 'Aquedにより設定されたAutoModのId配列', nullable: true })
	autoMods?: string[];

	constructor(guildId: string) {
		this.guildId = guildId;
	}
}
