import { MigrationInterface, QueryRunner } from "typeorm";

export class DataBase1739673555021 implements MigrationInterface {
    name = 'DataBase1739673555021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`SUPER_GLOBAL_CHAT_SEND_IDS\` (\`webhook_url\` text NOT NULL COMMENT '送信に使用したWebhook URL', \`channel_id\` bigint NOT NULL COMMENT 'Webhook URLが削除された場合の作成元チャンネル', \`message_id\` bigint NOT NULL COMMENT '送信済みメッセージID', \`parent_data\` bigint NULL COMMENT 'JSONのメッセージID', PRIMARY KEY (\`message_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` DROP COLUMN \`send_ids\``);
        await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_SEND_IDS\` ADD CONSTRAINT \`FK_21480412ebd394f64a90671bde7\` FOREIGN KEY (\`parent_data\`) REFERENCES \`SUPER_GLOBAL_CHAT_DATA\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_SEND_IDS\` DROP FOREIGN KEY \`FK_21480412ebd394f64a90671bde7\``);
        await queryRunner.query(`ALTER TABLE \`SUPER_GLOBAL_CHAT_DATA\` ADD \`send_ids\` json NOT NULL COMMENT '送信したメッセージIDら'`);
        await queryRunner.query(`DROP TABLE \`SUPER_GLOBAL_CHAT_SEND_IDS\``);
    }

}
