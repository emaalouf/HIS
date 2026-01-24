-- CreateTable
CREATE TABLE `nephrology_visits` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `visitDate` DATETIME(3) NOT NULL,
    `reason` TEXT NULL,
    `symptoms` TEXT NULL,
    `ckdStage` ENUM('STAGE_1', 'STAGE_2', 'STAGE_3A', 'STAGE_3B', 'STAGE_4', 'STAGE_5', 'ESRD') NULL,
    `egfr` DOUBLE NULL,
    `bpSystolic` INTEGER NULL,
    `bpDiastolic` INTEGER NULL,
    `diagnosis` TEXT NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nephrology_visits_patientId_idx`(`patientId`),
    INDEX `nephrology_visits_providerId_idx`(`providerId`),
    INDEX `nephrology_visits_visitDate_idx`(`visitDate`),
    INDEX `nephrology_visits_status_idx`(`status`),
    INDEX `nephrology_visits_ckdStage_idx`(`ckdStage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nephrology_lab_results` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `collectedAt` DATETIME(3) NOT NULL,
    `creatinine` DOUBLE NULL,
    `bun` DOUBLE NULL,
    `egfr` DOUBLE NULL,
    `potassium` DOUBLE NULL,
    `sodium` DOUBLE NULL,
    `chloride` DOUBLE NULL,
    `bicarbonate` DOUBLE NULL,
    `calcium` DOUBLE NULL,
    `phosphorus` DOUBLE NULL,
    `albumin` DOUBLE NULL,
    `hemoglobin` DOUBLE NULL,
    `pth` DOUBLE NULL,
    `vitaminD` DOUBLE NULL,
    `uricAcid` DOUBLE NULL,
    `urineProtein` DOUBLE NULL,
    `urineAlbumin` DOUBLE NULL,
    `urineCreatinine` DOUBLE NULL,
    `uacr` DOUBLE NULL,
    `upcr` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nephrology_lab_results_patientId_idx`(`patientId`),
    INDEX `nephrology_lab_results_collectedAt_idx`(`collectedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nephrology_imaging_studies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `modality` ENUM('ULTRASOUND', 'CT', 'MRI', 'XRAY', 'NUCLEAR', 'OTHER') NOT NULL,
    `studyType` VARCHAR(191) NULL,
    `findings` TEXT NULL,
    `impression` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nephrology_imaging_studies_patientId_idx`(`patientId`),
    INDEX `nephrology_imaging_studies_providerId_idx`(`providerId`),
    INDEX `nephrology_imaging_studies_visitId_idx`(`visitId`),
    INDEX `nephrology_imaging_studies_performedAt_idx`(`performedAt`),
    INDEX `nephrology_imaging_studies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nephrology_biopsies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `performedAt` DATETIME(3) NOT NULL,
    `indication` TEXT NULL,
    `specimenType` VARCHAR(191) NULL,
    `pathologySummary` TEXT NULL,
    `complications` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nephrology_biopsies_patientId_idx`(`patientId`),
    INDEX `nephrology_biopsies_providerId_idx`(`providerId`),
    INDEX `nephrology_biopsies_visitId_idx`(`visitId`),
    INDEX `nephrology_biopsies_performedAt_idx`(`performedAt`),
    INDEX `nephrology_biopsies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nephrology_medication_orders` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `medicationName` VARCHAR(191) NOT NULL,
    `dose` VARCHAR(191) NULL,
    `route` ENUM('IV', 'PO', 'IM', 'SC', 'SL', 'OTHER') NULL,
    `frequency` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `lastAdministeredAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `indication` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nephrology_medication_orders_patientId_idx`(`patientId`),
    INDEX `nephrology_medication_orders_providerId_idx`(`providerId`),
    INDEX `nephrology_medication_orders_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `nephrology_visits` ADD CONSTRAINT `nephrology_visits_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_visits` ADD CONSTRAINT `nephrology_visits_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_lab_results` ADD CONSTRAINT `nephrology_lab_results_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_imaging_studies` ADD CONSTRAINT `nephrology_imaging_studies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_imaging_studies` ADD CONSTRAINT `nephrology_imaging_studies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_imaging_studies` ADD CONSTRAINT `nephrology_imaging_studies_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `nephrology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_biopsies` ADD CONSTRAINT `nephrology_biopsies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_biopsies` ADD CONSTRAINT `nephrology_biopsies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_biopsies` ADD CONSTRAINT `nephrology_biopsies_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `nephrology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_medication_orders` ADD CONSTRAINT `nephrology_medication_orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nephrology_medication_orders` ADD CONSTRAINT `nephrology_medication_orders_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
