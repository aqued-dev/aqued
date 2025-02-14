import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataBase1739532274144 implements MigrationInterface {
	name = 'DataBase1739532274144';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE \`CHANNEL_SETTING\` (\`CHANNEL_ID\` bigint NOT NULL COMMENT 'チャンネルID', \`GLOBAL_CHAT\` tinyint NULL COMMENT 'グローバルチャット参加の有無', \`SUPER_GLOBAL\` tinyint NULL COMMENT 'スーパーグローバルチャット参加の有無', \`AUTO_NEWS\` tinyint NULL COMMENT 'ニュース自動公開の有無', \`FORCE_PIN\` json NULL COMMENT 'メッセージを下に固定', PRIMARY KEY (\`CHANNEL_ID\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`ERROR\` (\`id\` bigint NOT NULL COMMENT 'エラーSnowFlake', \`url\` text NOT NULL COMMENT 'エラーのURL', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`FREE_CHANNEL\` (\`id\` bigint NOT NULL COMMENT '識別番号', \`category_id\` bigint NOT NULL COMMENT 'カテゴリID', \`user_limit\` text NOT NULL COMMENT '1ユーザーのチャンネル数制限', \`user_ids\` text NULL COMMENT '使用ユーザー達', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`GLOBAL_CHAT_BAN\` (\`id\` bigint NOT NULL COMMENT 'ユーザーID', \`reason\` text NOT NULL COMMENT '理由', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`GLOBAL_CHAT_MESSAGE\` (\`id\` bigint NOT NULL COMMENT 'メッセージID', \`channelId\` bigint NOT NULL COMMENT '送信チャンネルID', \`guildId\` bigint NOT NULL COMMENT '送信ギルドID', \`messages\` json NOT NULL COMMENT '送信済みメッセージ', PRIMARY KEY (\`id\`, \`channelId\`, \`guildId\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`GUILD_SETTING\` (\`GUILD_ID\` bigint NOT NULL COMMENT 'ギルドID', \`AUTO_MODS\` text NULL COMMENT 'Aquedにより設定されたAutoModのId配列', \`WELCOME_MESSAGE\` json NULL COMMENT 'ウェルカムメッセージ', \`LEAVE_MESSAGE\` json NULL COMMENT '退出メッセージ', \`MESSAGE_EXPANDER\` json NULL COMMENT 'メッセージ展開の設定', PRIMARY KEY (\`GUILD_ID\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`SUPER_GLOBAL_CHAT_DATA\` (\`id\` bigint NOT NULL COMMENT 'JSONのメッセージID', \`message_id\` bigint NOT NULL COMMENT '元メッセージのID', \`send_ids\` text NOT NULL COMMENT '送信したメッセージIDら', \`edit_id\` bigint NULL COMMENT '編集のJSONメッセージID', \`delete_id\` bigint NULL COMMENT '削除のJSONメッセージID', \`reply_id\` bigint NULL COMMENT '返信元のJSONメッセージID', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
		);
		await queryRunner.query(
			`CREATE TABLE \`USER_SETTING\` (\`USER_ID\` bigint NOT NULL COMMENT 'ユーザーID', \`AFK\` tinyint NULL COMMENT 'afkであるか', \`AFK_REASON\` text NULL COMMENT 'afkである理由', \`AFK_MENTIONS\` json NULL COMMENT 'afkメンションデータ', PRIMARY KEY (\`USER_ID\`)) ENGINE=InnoDB`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE \`USER_SETTING\``);
		await queryRunner.query(`DROP TABLE \`SUPER_GLOBAL_CHAT_DATA\``);
		await queryRunner.query(`DROP TABLE \`GUILD_SETTING\``);
		await queryRunner.query(`DROP TABLE \`GLOBAL_CHAT_MESSAGE\``);
		await queryRunner.query(`DROP TABLE \`GLOBAL_CHAT_BAN\``);
		await queryRunner.query(`DROP TABLE \`FREE_CHANNEL\``);
		await queryRunner.query(`DROP TABLE \`ERROR\``);
		await queryRunner.query(`DROP TABLE \`CHANNEL_SETTING\``);
	}
}
