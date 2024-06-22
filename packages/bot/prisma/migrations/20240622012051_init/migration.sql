-- DropForeignKey
ALTER TABLE `afkmentions` DROP FOREIGN KEY `AFKMentions_userId_fkey`;

-- AddForeignKey
ALTER TABLE `AfkMentions` ADD CONSTRAINT `AfkMentions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Afk`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
