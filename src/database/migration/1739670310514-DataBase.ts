import { MigrationInterface, QueryRunner } from "typeorm";

export class DataBase1739670310514 implements MigrationInterface {
    name = 'DataBase1739670310514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CHANNEL_SETTING\` ADD \`URL_CHECK\` tinyint NULL COMMENT 'チャンネル内自動URLチェック'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CHANNEL_SETTING\` DROP COLUMN \`URL_CHECK\``);
    }

}
