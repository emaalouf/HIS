-- CreateTable
CREATE TABLE `icu_admissions` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `admissionNumber` VARCHAR(191) NOT NULL,
    `admissionDate` DATETIME(3) NOT NULL,
    `admissionSource` ENUM('ED', 'OR', 'WARD', 'ANOTHER_HOSPITAL', 'DIRECT_ADMISSION') NOT NULL,
    `admittingProviderId` VARCHAR(191) NOT NULL,
    `bedId` VARCHAR(191) NULL,
    `bedNumber` VARCHAR(191) NULL,
    `apacheIIScore` INTEGER NULL,
    `apacheIICalculatedAt` DATETIME(3) NULL,
    `primaryDiagnosis` TEXT NOT NULL,
    `secondaryDiagnoses` TEXT NULL,
    `admissionReason` TEXT NULL,
    `currentStatus` ENUM('ADMITTED', 'CRITICAL', 'STABLE', 'IMPROVING', 'DETERIORATING', 'DISCHARGED', 'DECEASED') NOT NULL DEFAULT 'ADMITTED',
    `isVentilated` BOOLEAN NOT NULL DEFAULT false,
    `isSedated` BOOLEAN NOT NULL DEFAULT false,
    `isIsolated` BOOLEAN NOT NULL DEFAULT false,
    `isolationType` VARCHAR(191) NULL,
    `expectedLos` INTEGER NULL,
    `dischargeDate` DATETIME(3) NULL,
    `dischargeDisposition` VARCHAR(191) NULL,
    `dischargeProviderId` VARCHAR(191) NULL,
    `icuLos` INTEGER NULL,
    `hospitalLos` INTEGER NULL,
    `diedInIcu` BOOLEAN NOT NULL DEFAULT false,
    `admissionNotes` TEXT NULL,
    `dischargeNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `icu_admissions_admissionNumber_key`(`admissionNumber`),
    INDEX `icu_admissions_patientId_idx`(`patientId`),
    INDEX `icu_admissions_admissionNumber_idx`(`admissionNumber`),
    INDEX `icu_admissions_admissionDate_idx`(`admissionDate`),
    INDEX `icu_admissions_currentStatus_idx`(`currentStatus`),
    INDEX `icu_admissions_admittingProviderId_idx`(`admittingProviderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `icu_vital_signs` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recordedById` VARCHAR(191) NOT NULL,
    `heartRate` INTEGER NULL,
    `systolicBP` INTEGER NULL,
    `diastolicBP` INTEGER NULL,
    `meanArterialPressure` INTEGER NULL,
    `respiratoryRate` INTEGER NULL,
    `temperature` DOUBLE NULL,
    `oxygenSaturation` DOUBLE NULL,
    `gcsEye` INTEGER NULL,
    `gcsVerbal` INTEGER NULL,
    `gcsMotor` INTEGER NULL,
    `gcsTotal` INTEGER NULL,
    `cvp` INTEGER NULL,
    `papSystolic` INTEGER NULL,
    `papDiastolic` INTEGER NULL,
    `pcwp` INTEGER NULL,
    `cardiacOutput` DOUBLE NULL,
    `cardiacIndex` DOUBLE NULL,
    `painScore` INTEGER NULL,
    `isCritical` BOOLEAN NOT NULL DEFAULT false,
    `criticalAlerts` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `icu_vital_signs_admissionId_idx`(`admissionId`),
    INDEX `icu_vital_signs_recordedAt_idx`(`recordedAt`),
    INDEX `icu_vital_signs_isCritical_idx`(`isCritical`),
    INDEX `icu_vital_signs_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventilator_settings` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recordedById` VARCHAR(191) NOT NULL,
    `ventilatorMode` ENUM('AC_VC', 'AC_PC', 'SIMV', 'CPAP', 'PS', 'BiPAP', 'APRV', 'PRVC', 'OTHER') NOT NULL,
    `fio2` DOUBLE NOT NULL,
    `peep` INTEGER NULL,
    `tidalVolume` INTEGER NULL,
    `respiratoryRate` INTEGER NULL,
    `pressureSupport` INTEGER NULL,
    `peakPressure` INTEGER NULL,
    `plateauPressure` INTEGER NULL,
    `ieRatio` VARCHAR(191) NULL,
    `inspiratoryTime` DOUBLE NULL,
    `flowRate` INTEGER NULL,
    `sensitivity` INTEGER NULL,
    `rsbi` DOUBLE NULL,
    `nif` INTEGER NULL,
    `spontaneousVt` INTEGER NULL,
    `spontaneousRate` INTEGER NULL,
    `isExtubated` BOOLEAN NOT NULL DEFAULT false,
    `extubationDate` DATETIME(3) NULL,
    `extubationNotes` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ventilator_settings_admissionId_idx`(`admissionId`),
    INDEX `ventilator_settings_recordedAt_idx`(`recordedAt`),
    INDEX `ventilator_settings_isExtubated_idx`(`isExtubated`),
    INDEX `ventilator_settings_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sedation_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `assessedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assessedById` VARCHAR(191) NOT NULL,
    `rassScore` INTEGER NOT NULL,
    `camIcuPositive` BOOLEAN NULL,
    `camIcuFeature1` BOOLEAN NULL,
    `camIcuFeature2` BOOLEAN NULL,
    `camIcuFeature3` BOOLEAN NULL,
    `camIcuFeature4` BOOLEAN NULL,
    `painScore` INTEGER NULL,
    `painScale` VARCHAR(191) NULL,
    `sedationMedications` TEXT NULL,
    `sedationGoal` VARCHAR(191) NULL,
    `deliriumManagement` TEXT NULL,
    `restraintsUsed` BOOLEAN NOT NULL DEFAULT false,
    `restraintType` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sedation_assessments_admissionId_idx`(`admissionId`),
    INDEX `sedation_assessments_assessedAt_idx`(`assessedAt`),
    INDEX `sedation_assessments_rassScore_idx`(`rassScore`),
    INDEX `sedation_assessments_camIcuPositive_idx`(`camIcuPositive`),
    INDEX `sedation_assessments_assessedById_idx`(`assessedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lines_tubes_drains` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `deviceSubtype` VARCHAR(191) NOT NULL,
    `insertedAt` DATETIME(3) NOT NULL,
    `insertedById` VARCHAR(191) NOT NULL,
    `insertionSite` VARCHAR(191) NULL,
    `insertionNotes` TEXT NULL,
    `size` VARCHAR(191) NULL,
    `length` VARCHAR(191) NULL,
    `numberOfLumens` INTEGER NULL,
    `dressingChangeDate` DATETIME(3) NULL,
    `tubingChangeDate` DATETIME(3) NULL,
    `removedAt` DATETIME(3) NULL,
    `removedById` VARCHAR(191) NULL,
    `removalReason` VARCHAR(191) NULL,
    `complications` TEXT NULL,
    `infectionSigns` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lines_tubes_drains_admissionId_idx`(`admissionId`),
    INDEX `lines_tubes_drains_insertedAt_idx`(`insertedAt`),
    INDEX `lines_tubes_drains_isActive_idx`(`isActive`),
    INDEX `lines_tubes_drains_insertedById_idx`(`insertedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fluid_balances` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recordedById` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `ivFluids` INTEGER NOT NULL DEFAULT 0,
    `enteralFeeds` INTEGER NOT NULL DEFAULT 0,
    `oralIntake` INTEGER NOT NULL DEFAULT 0,
    `bloodProducts` INTEGER NOT NULL DEFAULT 0,
    `medications` INTEGER NOT NULL DEFAULT 0,
    `otherIntake` INTEGER NOT NULL DEFAULT 0,
    `totalIntake` INTEGER NOT NULL DEFAULT 0,
    `urineOutput` INTEGER NOT NULL DEFAULT 0,
    `ngTubeDrainage` INTEGER NOT NULL DEFAULT 0,
    `chestTubeDrainage` INTEGER NOT NULL DEFAULT 0,
    `stool` INTEGER NOT NULL DEFAULT 0,
    `woundDrainage` INTEGER NOT NULL DEFAULT 0,
    `otherOutput` INTEGER NOT NULL DEFAULT 0,
    `totalOutput` INTEGER NOT NULL DEFAULT 0,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `cumulativeBalance` INTEGER NOT NULL DEFAULT 0,
    `urineColor` VARCHAR(191) NULL,
    `urineClarity` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `fluid_balances_admissionId_idx`(`admissionId`),
    INDEX `fluid_balances_recordedAt_idx`(`recordedAt`),
    INDEX `fluid_balances_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `icu_flowsheets` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recordedById` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `activityLevel` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `turnsPerformed` INTEGER NOT NULL DEFAULT 0,
    `skinAssessment` TEXT NULL,
    `pressureUlcerRisk` VARCHAR(191) NULL,
    `fallRisk` VARCHAR(191) NULL,
    `restraintsChecked` BOOLEAN NOT NULL DEFAULT false,
    `linesChecked` BOOLEAN NOT NULL DEFAULT false,
    `tubesChecked` BOOLEAN NOT NULL DEFAULT false,
    `bathType` VARCHAR(191) NULL,
    `oralCare` BOOLEAN NOT NULL DEFAULT false,
    `eyeCare` BOOLEAN NOT NULL DEFAULT false,
    `familyUpdated` BOOLEAN NOT NULL DEFAULT false,
    `familyUpdateNotes` TEXT NULL,
    `events` TEXT NULL,
    `planForNextShift` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `icu_flowsheets_admissionId_idx`(`admissionId`),
    INDEX `icu_flowsheets_recordedAt_idx`(`recordedAt`),
    INDEX `icu_flowsheets_shift_idx`(`shift`),
    INDEX `icu_flowsheets_recordedById_idx`(`recordedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `icu_daily_goals` (
    `id` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NOT NULL,
    `goalDate` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `patientStatus` TEXT NULL,
    `overnightEvents` TEXT NULL,
    `ventilationGoal` TEXT NULL,
    `sedationGoal` TEXT NULL,
    `mobilityGoal` TEXT NULL,
    `nutritionGoal` TEXT NULL,
    `liberationTrial` BOOLEAN NOT NULL DEFAULT false,
    `liberationTrialTime` DATETIME(3) NULL,
    `extubationGoal` BOOLEAN NOT NULL DEFAULT false,
    `dvtProphylaxis` BOOLEAN NOT NULL DEFAULT false,
    `pepticUlcerProphylaxis` BOOLEAN NOT NULL DEFAULT false,
    `familyCommunication` TEXT NULL,
    `familyMeetingScheduled` BOOLEAN NOT NULL DEFAULT false,
    `familyMeetingTime` DATETIME(3) NULL,
    `dischargeAnticipatedDate` DATETIME(3) NULL,
    `dischargeDispositionPlanned` VARCHAR(191) NULL,
    `actionItems` TEXT NULL,
    `goalsMet` BOOLEAN NULL,
    `barriersToGoals` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `icu_daily_goals_admissionId_idx`(`admissionId`),
    INDEX `icu_daily_goals_goalDate_idx`(`goalDate`),
    INDEX `icu_daily_goals_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `icu_admissions` ADD CONSTRAINT `icu_admissions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_admissions` ADD CONSTRAINT `icu_admissions_admittingProviderId_fkey` FOREIGN KEY (`admittingProviderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_admissions` ADD CONSTRAINT `icu_admissions_dischargeProviderId_fkey` FOREIGN KEY (`dischargeProviderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_vital_signs` ADD CONSTRAINT `icu_vital_signs_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_vital_signs` ADD CONSTRAINT `icu_vital_signs_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventilator_settings` ADD CONSTRAINT `ventilator_settings_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventilator_settings` ADD CONSTRAINT `ventilator_settings_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sedation_assessments` ADD CONSTRAINT `sedation_assessments_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sedation_assessments` ADD CONSTRAINT `sedation_assessments_assessedById_fkey` FOREIGN KEY (`assessedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lines_tubes_drains` ADD CONSTRAINT `lines_tubes_drains_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lines_tubes_drains` ADD CONSTRAINT `lines_tubes_drains_insertedById_fkey` FOREIGN KEY (`insertedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lines_tubes_drains` ADD CONSTRAINT `lines_tubes_drains_removedById_fkey` FOREIGN KEY (`removedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fluid_balances` ADD CONSTRAINT `fluid_balances_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fluid_balances` ADD CONSTRAINT `fluid_balances_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_flowsheets` ADD CONSTRAINT `icu_flowsheets_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_flowsheets` ADD CONSTRAINT `icu_flowsheets_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_daily_goals` ADD CONSTRAINT `icu_daily_goals_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `icu_admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `icu_daily_goals` ADD CONSTRAINT `icu_daily_goals_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
