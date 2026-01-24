-- CreateTable
CREATE TABLE `cardiology_visits` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `visitDate` DATETIME(3) NOT NULL,
    `reason` TEXT NULL,
    `symptoms` TEXT NULL,
    `diagnosis` TEXT NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_visits_patientId_idx`(`patientId`),
    INDEX `cardiology_visits_providerId_idx`(`providerId`),
    INDEX `cardiology_visits_visitDate_idx`(`visitDate`),
    INDEX `cardiology_visits_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_ecgs` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `recordedAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NULL,
    `rhythm` VARCHAR(191) NULL,
    `heartRate` INTEGER NULL,
    `prInterval` INTEGER NULL,
    `qrsDuration` INTEGER NULL,
    `qtInterval` INTEGER NULL,
    `qtc` INTEGER NULL,
    `interpretation` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_ecgs_patientId_idx`(`patientId`),
    INDEX `cardiology_ecgs_providerId_idx`(`providerId`),
    INDEX `cardiology_ecgs_visitId_idx`(`visitId`),
    INDEX `cardiology_ecgs_recordedAt_idx`(`recordedAt`),
    INDEX `cardiology_ecgs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_echos` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NULL,
    `lvef` DOUBLE NULL,
    `lvEndDiastolicDia` DOUBLE NULL,
    `lvEndSystolicDia` DOUBLE NULL,
    `rvFunction` VARCHAR(191) NULL,
    `valveFindings` TEXT NULL,
    `wallMotion` TEXT NULL,
    `pericardialEffusion` BOOLEAN NULL,
    `summary` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_echos_patientId_idx`(`patientId`),
    INDEX `cardiology_echos_providerId_idx`(`providerId`),
    INDEX `cardiology_echos_visitId_idx`(`visitId`),
    INDEX `cardiology_echos_performedAt_idx`(`performedAt`),
    INDEX `cardiology_echos_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_stress_tests` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NULL,
    `protocol` VARCHAR(191) NULL,
    `durationMinutes` INTEGER NULL,
    `mets` DOUBLE NULL,
    `maxHeartRate` INTEGER NULL,
    `maxBpSystolic` INTEGER NULL,
    `maxBpDiastolic` INTEGER NULL,
    `symptoms` TEXT NULL,
    `result` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_stress_tests_patientId_idx`(`patientId`),
    INDEX `cardiology_stress_tests_providerId_idx`(`providerId`),
    INDEX `cardiology_stress_tests_visitId_idx`(`visitId`),
    INDEX `cardiology_stress_tests_performedAt_idx`(`performedAt`),
    INDEX `cardiology_stress_tests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_procedures` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `procedureDate` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NULL,
    `indication` TEXT NULL,
    `findings` TEXT NULL,
    `complications` TEXT NULL,
    `outcome` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_procedures_patientId_idx`(`patientId`),
    INDEX `cardiology_procedures_providerId_idx`(`providerId`),
    INDEX `cardiology_procedures_visitId_idx`(`visitId`),
    INDEX `cardiology_procedures_procedureDate_idx`(`procedureDate`),
    INDEX `cardiology_procedures_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_devices` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `implantDate` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    `lastInterrogationDate` DATETIME(3) NULL,
    `nextFollowUpDate` DATETIME(3) NULL,
    `batteryStatus` VARCHAR(191) NULL,
    `settings` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_devices_patientId_idx`(`patientId`),
    INDEX `cardiology_devices_providerId_idx`(`providerId`),
    INDEX `cardiology_devices_implantDate_idx`(`implantDate`),
    INDEX `cardiology_devices_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_medication_orders` (
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

    INDEX `cardiology_medication_orders_patientId_idx`(`patientId`),
    INDEX `cardiology_medication_orders_providerId_idx`(`providerId`),
    INDEX `cardiology_medication_orders_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_lab_results` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `collectedAt` DATETIME(3) NOT NULL,
    `troponin` DOUBLE NULL,
    `bnp` DOUBLE NULL,
    `ntProBnp` DOUBLE NULL,
    `ckmb` DOUBLE NULL,
    `totalCholesterol` DOUBLE NULL,
    `ldl` DOUBLE NULL,
    `hdl` DOUBLE NULL,
    `triglycerides` DOUBLE NULL,
    `crp` DOUBLE NULL,
    `inr` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_lab_results_patientId_idx`(`patientId`),
    INDEX `cardiology_lab_results_collectedAt_idx`(`collectedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cardiology_visits` ADD CONSTRAINT `cardiology_visits_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_visits` ADD CONSTRAINT `cardiology_visits_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_ecgs` ADD CONSTRAINT `cardiology_ecgs_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_ecgs` ADD CONSTRAINT `cardiology_ecgs_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_ecgs` ADD CONSTRAINT `cardiology_ecgs_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_echos` ADD CONSTRAINT `cardiology_echos_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_echos` ADD CONSTRAINT `cardiology_echos_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_echos` ADD CONSTRAINT `cardiology_echos_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_stress_tests` ADD CONSTRAINT `cardiology_stress_tests_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_stress_tests` ADD CONSTRAINT `cardiology_stress_tests_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_stress_tests` ADD CONSTRAINT `cardiology_stress_tests_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_procedures` ADD CONSTRAINT `cardiology_procedures_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_procedures` ADD CONSTRAINT `cardiology_procedures_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_procedures` ADD CONSTRAINT `cardiology_procedures_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_devices` ADD CONSTRAINT `cardiology_devices_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_devices` ADD CONSTRAINT `cardiology_devices_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_medication_orders` ADD CONSTRAINT `cardiology_medication_orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_medication_orders` ADD CONSTRAINT `cardiology_medication_orders_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_lab_results` ADD CONSTRAINT `cardiology_lab_results_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
