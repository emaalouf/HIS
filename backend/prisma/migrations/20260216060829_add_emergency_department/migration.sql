-- CreateTable
CREATE TABLE `ed_visits` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `visitNumber` VARCHAR(191) NOT NULL,
    `arrivalTime` DATETIME(3) NOT NULL,
    `chiefComplaint` TEXT NOT NULL,
    `arrivalMode` VARCHAR(191) NULL,
    `ageAtVisit` INTEGER NOT NULL,
    `genderAtVisit` VARCHAR(191) NOT NULL,
    `triageLevel` ENUM('ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5') NULL,
    `triageTime` DATETIME(3) NULL,
    `triageNurseId` VARCHAR(191) NULL,
    `triageTemperature` DOUBLE NULL,
    `triageHeartRate` INTEGER NULL,
    `triageRespiratoryRate` INTEGER NULL,
    `triageBloodPressure` VARCHAR(191) NULL,
    `triageOxygenSaturation` DOUBLE NULL,
    `triagePainScore` INTEGER NULL,
    `triageGlasgowComaScore` INTEGER NULL,
    `currentStatus` ENUM('PENDING', 'TRIAGE', 'IN_PROGRESS', 'UNDER_OBSERVATION', 'WAITING_RESULTS', 'READY_FOR_DISCHARGE', 'DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED') NOT NULL DEFAULT 'PENDING',
    `assignedProviderId` VARCHAR(191) NULL,
    `bedAssignment` VARCHAR(191) NULL,
    `bedAssignmentTime` DATETIME(3) NULL,
    `historyOfPresentIllness` TEXT NULL,
    `physicalExamination` TEXT NULL,
    `differentialDiagnosis` TEXT NULL,
    `finalDiagnosis` TEXT NULL,
    `labsOrdered` TEXT NULL,
    `imagingOrdered` TEXT NULL,
    `proceduresPerformed` TEXT NULL,
    `medicationsGiven` TEXT NULL,
    `providerFirstContactTime` DATETIME(3) NULL,
    `roomAssignmentTime` DATETIME(3) NULL,
    `firstLabResultsTime` DATETIME(3) NULL,
    `firstImagingResultsTime` DATETIME(3) NULL,
    `dispositionDecisionTime` DATETIME(3) NULL,
    `dischargeTime` DATETIME(3) NULL,
    `disposition` ENUM('DISCHARGE_HOME', 'ADMIT_TO_WARD', 'ADMIT_TO_ICU', 'TRANSFER_TO_ANOTHER_HOSPITAL', 'TRANSFER_TO_ANOTHER_ED', 'LEAVE_AMA', 'DEATH') NULL,
    `dispositionNotes` TEXT NULL,
    `consultationsRequested` TEXT NULL,
    `cardiacArrest` BOOLEAN NOT NULL DEFAULT false,
    `intubationPerformed` BOOLEAN NOT NULL DEFAULT false,
    `cprPerformed` BOOLEAN NOT NULL DEFAULT false,
    `followUpInstructions` TEXT NULL,
    `followUpRecommended` BOOLEAN NOT NULL DEFAULT false,
    `followUpWithin` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ed_visits_visitNumber_key`(`visitNumber`),
    INDEX `ed_visits_patientId_idx`(`patientId`),
    INDEX `ed_visits_visitNumber_idx`(`visitNumber`),
    INDEX `ed_visits_arrivalTime_idx`(`arrivalTime`),
    INDEX `ed_visits_currentStatus_idx`(`currentStatus`),
    INDEX `ed_visits_triageLevel_idx`(`triageLevel`),
    INDEX `ed_visits_assignedProviderId_idx`(`assignedProviderId`),
    INDEX `ed_visits_dischargeTime_idx`(`dischargeTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ed_triages` (
    `id` VARCHAR(191) NOT NULL,
    `visitId` VARCHAR(191) NOT NULL,
    `triageNurseId` VARCHAR(191) NOT NULL,
    `triageTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `triageLevel` ENUM('ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5') NOT NULL,
    `temperature` DOUBLE NULL,
    `heartRate` INTEGER NULL,
    `respiratoryRate` INTEGER NULL,
    `bloodPressure` VARCHAR(191) NULL,
    `oxygenSaturation` DOUBLE NULL,
    `painScore` INTEGER NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `chiefComplaint` TEXT NOT NULL,
    `historyOfPresentIllness` TEXT NULL,
    `immunocompromised` BOOLEAN NOT NULL DEFAULT false,
    `pregnancyStatus` VARCHAR(191) NULL,
    `allergies` VARCHAR(191) NULL,
    `currentMedications` VARCHAR(191) NULL,
    `psychiatricHold` BOOLEAN NOT NULL DEFAULT false,
    `isolationRequired` BOOLEAN NOT NULL DEFAULT false,
    `isolationType` VARCHAR(191) NULL,
    `triageNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ed_triages_visitId_idx`(`visitId`),
    INDEX `ed_triages_triageNurseId_idx`(`triageNurseId`),
    INDEX `ed_triages_triageTime_idx`(`triageTime`),
    INDEX `ed_triages_triageLevel_idx`(`triageLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ed_procedures` (
    `id` VARCHAR(191) NOT NULL,
    `visitId` VARCHAR(191) NOT NULL,
    `procedureType` ENUM('INTUBATION', 'CENTRAL_LINE', 'ARTERIAL_LINE', 'CHEST_TUBE', 'LUMBAR_PUNCTURE', 'THORACENTESIS', 'PARACENTESIS', 'JOINT_ASPIRATION', 'FRACTURE_REDUCTION', 'SUTURING', 'INCISION_DRAINAGE', 'CARDIOVERSION', 'DEFIBRILLATION', 'CPR', 'OTHER') NOT NULL,
    `procedureTime` DATETIME(3) NOT NULL,
    `performedById` VARCHAR(191) NOT NULL,
    `assistedById` VARCHAR(191) NULL,
    `procedureDescription` TEXT NOT NULL,
    `indication` TEXT NULL,
    `complications` TEXT NULL,
    `sedationUsed` BOOLEAN NOT NULL DEFAULT false,
    `sedationType` VARCHAR(191) NULL,
    `anesthesiaProviderId` VARCHAR(191) NULL,
    `outcome` VARCHAR(191) NULL,
    `specimenCollected` BOOLEAN NOT NULL DEFAULT false,
    `specimenType` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ed_procedures_visitId_idx`(`visitId`),
    INDEX `ed_procedures_performedById_idx`(`performedById`),
    INDEX `ed_procedures_procedureTime_idx`(`procedureTime`),
    INDEX `ed_procedures_procedureType_idx`(`procedureType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ed_flows` (
    `id` VARCHAR(191) NOT NULL,
    `visitId` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('WAITING', 'IN_TREATMENT', 'AWAITING_RESULTS', 'AWAITING_CONSULT', 'AWAITING_BED', 'DISPOSITION_DECIDED') NOT NULL,
    `location` VARCHAR(191) NULL,
    `providerId` VARCHAR(191) NULL,
    `clinicalNotes` TEXT NULL,
    `plan` TEXT NULL,
    `labsOrdered` BOOLEAN NOT NULL DEFAULT false,
    `imagingOrdered` BOOLEAN NOT NULL DEFAULT false,
    `medicationsOrdered` BOOLEAN NOT NULL DEFAULT false,
    `consultOrdered` BOOLEAN NOT NULL DEFAULT false,
    `labResultsAvailable` BOOLEAN NOT NULL DEFAULT false,
    `imagingResultsAvailable` BOOLEAN NOT NULL DEFAULT false,
    `timeInThisStatus` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ed_flows_visitId_idx`(`visitId`),
    INDEX `ed_flows_timestamp_idx`(`timestamp`),
    INDEX `ed_flows_status_idx`(`status`),
    INDEX `ed_flows_providerId_idx`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ed_visits` ADD CONSTRAINT `ed_visits_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_visits` ADD CONSTRAINT `ed_visits_triageNurseId_fkey` FOREIGN KEY (`triageNurseId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_visits` ADD CONSTRAINT `ed_visits_assignedProviderId_fkey` FOREIGN KEY (`assignedProviderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_triages` ADD CONSTRAINT `ed_triages_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `ed_visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_triages` ADD CONSTRAINT `ed_triages_triageNurseId_fkey` FOREIGN KEY (`triageNurseId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_procedures` ADD CONSTRAINT `ed_procedures_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `ed_visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_procedures` ADD CONSTRAINT `ed_procedures_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_procedures` ADD CONSTRAINT `ed_procedures_assistedById_fkey` FOREIGN KEY (`assistedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_flows` ADD CONSTRAINT `ed_flows_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `ed_visits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ed_flows` ADD CONSTRAINT `ed_flows_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
