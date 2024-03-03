-- CreateTable
CREATE TABLE `Ai` (
    `_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiThread` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiThreadHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userContent` TEXT NOT NULL,
    `aiContent` TEXT NOT NULL,
    `aiThreadId` VARCHAR(191) NULL,

    UNIQUE INDEX `AiThreadHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AiThreadHistory` ADD CONSTRAINT `AiThreadHistory_aiThreadId_fkey` FOREIGN KEY (`aiThreadId`) REFERENCES `AiThread`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
