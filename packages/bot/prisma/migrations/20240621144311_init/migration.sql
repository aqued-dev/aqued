-- CreateTable
CREATE TABLE `AFK` (
    `userId` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AFKMentions` (
    `userId` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AFKMentions` ADD CONSTRAINT `AFKMentions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AFK`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
