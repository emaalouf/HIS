-- CreateTable
CREATE TABLE `blood_donors` (
    `id` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `bloodType` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `medicalHistory` TEXT NULL,
    `isEligible` BOOLEAN NOT NULL DEFAULT true,
    `deferralReason` VARCHAR(191) NULL,
    `deferralUntil` DATETIME(3) NULL,
    `lastDonationDate` DATETIME(3) NULL,
    `totalDonations` INTEGER NOT NULL DEFAULT 0,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blood_donors_donorId_key`(`donorId`),
    INDEX `blood_donors_donorId_idx`(`donorId`),
    INDEX `blood_donors_bloodType_idx`(`bloodType`),
    INDEX `blood_donors_isEligible_idx`(`isEligible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_donations` (
    `id` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `donationNumber` VARCHAR(191) NOT NULL,
    `donationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `volumeCollected` INTEGER NOT NULL,
    `bloodType` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    `hivTest` VARCHAR(191) NULL,
    `hbvTest` VARCHAR(191) NULL,
    `hcvTest` VARCHAR(191) NULL,
    `syphilisTest` VARCHAR(191) NULL,
    `malariaTest` VARCHAR(191) NULL,
    `isProcessed` BOOLEAN NOT NULL DEFAULT false,
    `processedDate` DATETIME(3) NULL,
    `processedById` VARCHAR(191) NULL,
    `isQualified` BOOLEAN NOT NULL DEFAULT false,
    `disqualificationReason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blood_donations_donationNumber_key`(`donationNumber`),
    INDEX `blood_donations_donorId_idx`(`donorId`),
    INDEX `blood_donations_donationNumber_idx`(`donationNumber`),
    INDEX `blood_donations_donationDate_idx`(`donationDate`),
    INDEX `blood_donations_isQualified_idx`(`isQualified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_products` (
    `id` VARCHAR(191) NOT NULL,
    `productCode` VARCHAR(191) NOT NULL,
    `productType` ENUM('WHOLE_BLOOD', 'PRBC', 'FFP', 'PLATELETS', 'CRYOPRECIPITATE', 'GRANULOCYTES', 'ALBUMIN', 'IVIG') NOT NULL,
    `bloodType` ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE') NOT NULL,
    `donationId` VARCHAR(191) NOT NULL,
    `volume` INTEGER NOT NULL,
    `collectionDate` DATETIME(3) NOT NULL,
    `expirationDate` DATETIME(3) NOT NULL,
    `storageLocation` VARCHAR(191) NULL,
    `storageTemp` DOUBLE NULL,
    `status` ENUM('AVAILABLE', 'RESERVED', 'QUARANTINE', 'EXPIRED', 'DISCARDED', 'TRANSFUSED') NOT NULL DEFAULT 'QUARANTINE',
    `reservedForId` VARCHAR(191) NULL,
    `reservedUntil` DATETIME(3) NULL,
    `qcPassed` BOOLEAN NOT NULL DEFAULT false,
    `qcDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blood_products_productCode_key`(`productCode`),
    INDEX `blood_products_productCode_idx`(`productCode`),
    INDEX `blood_products_productType_idx`(`productType`),
    INDEX `blood_products_bloodType_idx`(`bloodType`),
    INDEX `blood_products_status_idx`(`status`),
    INDEX `blood_products_expirationDate_idx`(`expirationDate`),
    INDEX `blood_products_reservedForId_idx`(`reservedForId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cross_matches` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `testDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `testedById` VARCHAR(191) NOT NULL,
    `majorCrossMatch` ENUM('COMPATIBLE', 'INCOMPATIBLE', 'INCONCLUSIVE') NOT NULL,
    `minorCrossMatch` ENUM('COMPATIBLE', 'INCOMPATIBLE', 'INCONCLUSIVE') NOT NULL,
    `antibodyScreen` VARCHAR(191) NULL,
    `isCompatible` BOOLEAN NOT NULL,
    `incompatibilityReason` VARCHAR(191) NULL,
    `validUntil` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cross_matches_patientId_idx`(`patientId`),
    INDEX `cross_matches_productId_idx`(`productId`),
    INDEX `cross_matches_testDate_idx`(`testDate`),
    INDEX `cross_matches_isCompatible_idx`(`isCompatible`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_transfusions` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `orderingProviderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `indication` TEXT NOT NULL,
    `hemoglobin` DOUBLE NULL,
    `plateletCount` INTEGER NULL,
    `inr` DOUBLE NULL,
    `preTemp` DOUBLE NULL,
    `preHr` INTEGER NULL,
    `preBp` VARCHAR(191) NULL,
    `preRr` INTEGER NULL,
    `startedAt` DATETIME(3) NULL,
    `startedById` VARCHAR(191) NULL,
    `completedAt` DATETIME(3) NULL,
    `completedById` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'CROSSMATCHED', 'READY', 'IN_PROGRESS', 'COMPLETED', 'STOPPED', 'REACTION') NOT NULL DEFAULT 'ORDERED',
    `reactionOccurred` BOOLEAN NOT NULL DEFAULT false,
    `reactionType` ENUM('FEBRILE_NONHEMOLYTIC', 'ACUTE_HEMOLYTIC', 'DELAYED_HEMOLYTIC', 'ALLERGIC_URTICARIA', 'ANAPHYLAXIS', 'TRALI', 'TACO', 'SEPSIS', 'TA_GVHD', 'POST_TRANSFUSION_PURPURA') NULL,
    `reactionTime` DATETIME(3) NULL,
    `reactionDetails` TEXT NULL,
    `stoppedReason` VARCHAR(191) NULL,
    `postTemp` DOUBLE NULL,
    `postHr` INTEGER NULL,
    `postBp` VARCHAR(191) NULL,
    `postRr` INTEGER NULL,
    `hemoglobinPost` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blood_transfusions_orderNumber_key`(`orderNumber`),
    INDEX `blood_transfusions_patientId_idx`(`patientId`),
    INDEX `blood_transfusions_productId_idx`(`productId`),
    INDEX `blood_transfusions_orderNumber_idx`(`orderNumber`),
    INDEX `blood_transfusions_status_idx`(`status`),
    INDEX `blood_transfusions_startedAt_idx`(`startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blood_donations` ADD CONSTRAINT `blood_donations_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `blood_donors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_donations` ADD CONSTRAINT `blood_donations_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_products` ADD CONSTRAINT `blood_products_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `blood_donations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_products` ADD CONSTRAINT `blood_products_reservedForId_fkey` FOREIGN KEY (`reservedForId`) REFERENCES `patients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cross_matches` ADD CONSTRAINT `cross_matches_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cross_matches` ADD CONSTRAINT `cross_matches_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `blood_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cross_matches` ADD CONSTRAINT `cross_matches_testedById_fkey` FOREIGN KEY (`testedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_transfusions` ADD CONSTRAINT `blood_transfusions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_transfusions` ADD CONSTRAINT `blood_transfusions_orderingProviderId_fkey` FOREIGN KEY (`orderingProviderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_transfusions` ADD CONSTRAINT `blood_transfusions_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `blood_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_transfusions` ADD CONSTRAINT `blood_transfusions_startedById_fkey` FOREIGN KEY (`startedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_transfusions` ADD CONSTRAINT `blood_transfusions_completedById_fkey` FOREIGN KEY (`completedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
