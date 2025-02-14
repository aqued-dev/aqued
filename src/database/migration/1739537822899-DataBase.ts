import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataBase1739537822899 implements MigrationInterface {
	name = 'DataBase1739537822899';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` DROP COLUMN \`send_ids\``);
		await queryRunner.query(
			`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` ADD \`send_ids\` json NOT NULL COMMENT '送信したメッセージIDら'`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` DROP COLUMN \`send_ids\``);
		await queryRunner.query(
			`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` ADD \`send_ids\` text NOT NULL COMMENT '送信したメッセージIDら'`
		);
	}
}
