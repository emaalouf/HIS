-- CreateTable
CREATE TABLE `imaging_studies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `accessionNumber` VARCHAR(191) NOT NULL,
    `studyInstanceUid` VARCHAR(191) NULL,
    `modality` ENUM('XRAY', 'CT', 'MRI', 'ULTRASOUND', 'MAMMOGRAPHY', 'FLUOROSCOPY', 'PET', 'NUCLEAR_MEDICINE', 'ANGIOGRAPHY', 'DEXA') NOT NULL,
    `studyDescription` VARCHAR(191) NULL,
    `bodyPart` VARCHAR(191) NULL,
    `referringPhysicianId` VARCHAR(191) NULL,
    `radiologistId` VARCHAR(191) NULL,
    `technicianId` VARCHAR(191) NULL,
    `scheduledDate` DATETIME(3) NULL,
    `performedDate` DATETIME(3) NULL,
    `status` ENUM('ORDERED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `priority` ENUM('ROUTINE', 'URGENT', 'STAT') NOT NULL DEFAULT 'ROUTINE',
    `clinicalHistory` TEXT NULL,
    `indication` TEXT NULL,
    `contrastUsed` BOOLEAN NOT NULL DEFAULT false,
    `contrastType` VARCHAR(191) NULL,
    `doseReport` TEXT NULL,
    `numberOfSeries` INTEGER NOT NULL DEFAULT 0,
    `numberOfInstances` INTEGER NOT NULL DEFAULT 0,
    `storageLocation` VARCHAR(191) NULL,
    `dicomUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `imaging_studies_accessionNumber_key`(`accessionNumber`),
    UNIQUE INDEX `imaging_studies_studyInstanceUid_key`(`studyInstanceUid`),
    INDEX `imaging_studies_patientId_idx`(`patientId`),
    INDEX `imaging_studies_accessionNumber_idx`(`accessionNumber`),
    INDEX `imaging_studies_status_idx`(`status`),
    INDEX `imaging_studies_modality_idx`(`modality`),
    INDEX `imaging_studies_scheduledDate_idx`(`scheduledDate`),
    INDEX `imaging_studies_performedDate_idx`(`performedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dicom_series` (
    `id` VARCHAR(191) NOT NULL,
    `studyId` VARCHAR(191) NOT NULL,
    `seriesInstanceUid` VARCHAR(191) NOT NULL,
    `seriesNumber` INTEGER NULL,
    `modality` VARCHAR(191) NULL,
    `seriesDescription` VARCHAR(191) NULL,
    `bodyPartExamined` VARCHAR(191) NULL,
    `protocolName` VARCHAR(191) NULL,
    `sliceThickness` DOUBLE NULL,
    `numberOfSlices` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dicom_series_seriesInstanceUid_key`(`seriesInstanceUid`),
    INDEX `dicom_series_studyId_idx`(`studyId`),
    INDEX `dicom_series_seriesInstanceUid_idx`(`seriesInstanceUid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dicom_instances` (
    `id` VARCHAR(191) NOT NULL,
    `seriesId` VARCHAR(191) NOT NULL,
    `sopInstanceUid` VARCHAR(191) NOT NULL,
    `instanceNumber` INTEGER NULL,
    `sopClassUid` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NULL,
    `transferSyntaxUid` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dicom_instances_sopInstanceUid_key`(`sopInstanceUid`),
    INDEX `dicom_instances_seriesId_idx`(`seriesId`),
    INDEX `dicom_instances_sopInstanceUid_idx`(`sopInstanceUid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `radiologist_reports` (
    `id` VARCHAR(191) NOT NULL,
    `studyId` VARCHAR(191) NOT NULL,
    `radiologistId` VARCHAR(191) NOT NULL,
    `verifyingRadiologistId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'AMENDED') NOT NULL DEFAULT 'DRAFT',
    `findings` TEXT NULL,
    `impression` TEXT NULL,
    `recommendations` TEXT NULL,
    `comparisonStudyId` VARCHAR(191) NULL,
    `criticalFindings` BOOLEAN NOT NULL DEFAULT false,
    `notificationSent` BOOLEAN NOT NULL DEFAULT false,
    `reportedAt` DATETIME(3) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `radiologist_reports_studyId_idx`(`studyId`),
    INDEX `radiologist_reports_radiologistId_idx`(`radiologistId`),
    INDEX `radiologist_reports_status_idx`(`status`),
    INDEX `radiologist_reports_reportedAt_idx`(`reportedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `imaging_studies` ADD CONSTRAINT `imaging_studies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imaging_studies` ADD CONSTRAINT `imaging_studies_referringPhysicianId_fkey` FOREIGN KEY (`referringPhysicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imaging_studies` ADD CONSTRAINT `imaging_studies_radiologistId_fkey` FOREIGN KEY (`radiologistId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imaging_studies` ADD CONSTRAINT `imaging_studies_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dicom_series` ADD CONSTRAINT `dicom_series_studyId_fkey` FOREIGN KEY (`studyId`) REFERENCES `imaging_studies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dicom_instances` ADD CONSTRAINT `dicom_instances_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `dicom_series`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `radiologist_reports` ADD CONSTRAINT `radiologist_reports_studyId_fkey` FOREIGN KEY (`studyId`) REFERENCES `imaging_studies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `radiologist_reports` ADD CONSTRAINT `radiologist_reports_radiologistId_fkey` FOREIGN KEY (`radiologistId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `radiologist_reports` ADD CONSTRAINT `radiologist_reports_verifyingRadiologistId_fkey` FOREIGN KEY (`verifyingRadiologistId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
