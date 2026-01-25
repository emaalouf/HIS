/*
  Warnings:

  - You are about to alter the column `status` on the `encounters` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(27))`.

*/
-- AlterTable
ALTER TABLE `encounters` ADD COLUMN `admissionId` VARCHAR(191) NULL,
    ADD COLUMN `assessment` TEXT NULL,
    ADD COLUMN `diagnosis` TEXT NULL,
    ADD COLUMN `plan` TEXT NULL,
    MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `licenseNumber` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `specialty` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `cardiology_electrophysiology` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `procedureType` ENUM('PACEMAKER_IMPLANT', 'ICD_IMPLANT', 'CRT_IMPLANT', 'ABLATION', 'ELECTROPHYSIOLOGY_STUDY', 'LOOP_RECORDER_IMPLANT', 'LEAD_EXTRACTION', 'OTHER') NOT NULL,
    `indication` TEXT NULL,
    `arrhythmiaType` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `implantDate` DATETIME(3) NULL,
    `ablationTarget` VARCHAR(191) NULL,
    `fluoroscopyTime` INTEGER NULL,
    `complications` TEXT NULL,
    `outcome` TEXT NULL,
    `followUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_electrophysiology_patientId_idx`(`patientId`),
    INDEX `cardiology_electrophysiology_providerId_idx`(`providerId`),
    INDEX `cardiology_electrophysiology_visitId_idx`(`visitId`),
    INDEX `cardiology_electrophysiology_performedAt_idx`(`performedAt`),
    INDEX `cardiology_electrophysiology_status_idx`(`status`),
    INDEX `cardiology_electrophysiology_procedureType_idx`(`procedureType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cardiology_heart_failure` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `assessmentDate` DATETIME(3) NOT NULL,
    `etiology` TEXT NULL,
    `nyhaClass` ENUM('CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IV') NULL,
    `heartFailureStage` ENUM('STAGE_A', 'STAGE_B', 'STAGE_C', 'STAGE_D') NULL,
    `lvef` DOUBLE NULL,
    `symptoms` TEXT NULL,
    `medications` TEXT NULL,
    `mechanicalSupport` VARCHAR(191) NULL,
    `transplantStatus` VARCHAR(191) NULL,
    `implantableDevices` TEXT NULL,
    `rehospitalizations` INTEGER NULL,
    `lastHospitalization` DATETIME(3) NULL,
    `bnp` DOUBLE NULL,
    `ntProBnp` DOUBLE NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `nextFollowUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cardiology_heart_failure_patientId_idx`(`patientId`),
    INDEX `cardiology_heart_failure_providerId_idx`(`providerId`),
    INDEX `cardiology_heart_failure_visitId_idx`(`visitId`),
    INDEX `cardiology_heart_failure_assessmentDate_idx`(`assessmentDate`),
    INDEX `cardiology_heart_failure_status_idx`(`status`),
    INDEX `cardiology_heart_failure_nyhaClass_idx`(`nyhaClass`),
    INDEX `cardiology_heart_failure_heartFailureStage_idx`(`heartFailureStage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_visits` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `visitDate` DATETIME(3) NOT NULL,
    `reason` TEXT NULL,
    `symptoms` TEXT NULL,
    `mentalStatus` TEXT NULL,
    `cranialNerves` TEXT NULL,
    `motorExam` TEXT NULL,
    `sensoryExam` TEXT NULL,
    `reflexes` TEXT NULL,
    `coordination` TEXT NULL,
    `gait` TEXT NULL,
    `speech` TEXT NULL,
    `nihssScore` INTEGER NULL,
    `gcsScore` INTEGER NULL,
    `diagnosis` TEXT NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_visits_patientId_idx`(`patientId`),
    INDEX `neurology_visits_providerId_idx`(`providerId`),
    INDEX `neurology_visits_visitDate_idx`(`visitDate`),
    INDEX `neurology_visits_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinical_orders` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `encounterId` VARCHAR(191) NULL,
    `orderType` ENUM('LAB', 'IMAGING', 'MEDICATION', 'PROCEDURE', 'OTHER') NOT NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `priority` ENUM('ROUTINE', 'URGENT', 'STAT') NOT NULL DEFAULT 'ROUTINE',
    `orderedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orderName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `clinical_orders_patientId_idx`(`patientId`),
    INDEX `clinical_orders_providerId_idx`(`providerId`),
    INDEX `clinical_orders_encounterId_idx`(`encounterId`),
    INDEX `clinical_orders_orderType_idx`(`orderType`),
    INDEX `clinical_orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinical_results` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `reportedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultName` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `referenceRange` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'FINAL', 'AMENDED') NOT NULL DEFAULT 'PENDING',
    `flag` ENUM('NORMAL', 'ABNORMAL', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `clinical_results_orderId_idx`(`orderId`),
    INDEX `clinical_results_patientId_idx`(`patientId`),
    INDEX `clinical_results_reportedAt_idx`(`reportedAt`),
    INDEX `clinical_results_status_idx`(`status`),
    INDEX `clinical_results_flag_idx`(`flag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication_orders` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `encounterId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'ON_HOLD', 'COMPLETED', 'DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    `medicationName` VARCHAR(191) NOT NULL,
    `dose` VARCHAR(191) NULL,
    `route` ENUM('IV', 'PO', 'IM', 'SC', 'SL', 'INHALATION', 'TOPICAL', 'OTHER') NULL,
    `frequency` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `lastAdministeredAt` DATETIME(3) NULL,
    `indication` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medication_orders_patientId_idx`(`patientId`),
    INDEX `medication_orders_providerId_idx`(`providerId`),
    INDEX `medication_orders_encounterId_idx`(`encounterId`),
    INDEX `medication_orders_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medication_administrations` (
    `id` VARCHAR(191) NOT NULL,
    `medicationOrderId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `administeredById` VARCHAR(191) NULL,
    `administeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `doseGiven` VARCHAR(191) NULL,
    `status` ENUM('GIVEN', 'HELD', 'REFUSED', 'MISSED') NOT NULL DEFAULT 'GIVEN',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `medication_administrations_medicationOrderId_idx`(`medicationOrderId`),
    INDEX `medication_administrations_patientId_idx`(`patientId`),
    INDEX `medication_administrations_administeredById_idx`(`administeredById`),
    INDEX `medication_administrations_administeredAt_idx`(`administeredAt`),
    INDEX `medication_administrations_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wards` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wards_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beds` (
    `id` VARCHAR(191) NOT NULL,
    `wardId` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NULL,
    `bedLabel` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `beds_wardId_idx`(`wardId`),
    INDEX `beds_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admissions` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `wardId` VARCHAR(191) NULL,
    `bedId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `status` ENUM('ADMITTED', 'TRANSFERRED', 'DISCHARGED', 'CANCELLED') NOT NULL DEFAULT 'ADMITTED',
    `admitDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dischargeDate` DATETIME(3) NULL,
    `reason` TEXT NULL,
    `diagnosis` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `admissions_patientId_idx`(`patientId`),
    INDEX `admissions_providerId_idx`(`providerId`),
    INDEX `admissions_status_idx`(`status`),
    INDEX `admissions_admitDate_idx`(`admitDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `encounterId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'SUBMITTED', 'PARTIAL', 'PAID', 'DENIED', 'VOID') NOT NULL DEFAULT 'DRAFT',
    `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    `dueDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    INDEX `invoices_patientId_idx`(`patientId`),
    INDEX `invoices_encounterId_idx`(`encounterId`),
    INDEX `invoices_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_items` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `invoice_items_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER') NOT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reference` VARCHAR(191) NULL,
    `receivedById` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_invoiceId_idx`(`invoiceId`),
    INDEX `payments_patientId_idx`(`patientId`),
    INDEX `payments_paidAt_idx`(`paidAt`),
    INDEX `payments_method_idx`(`method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `claims` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `payerName` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'ACCEPTED', 'DENIED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    `submittedAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `claims_invoiceId_idx`(`invoiceId`),
    INDEX `claims_patientId_idx`(`patientId`),
    INDEX `claims_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operating_theaters` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `operating_theaters_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surgeries` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `admissionId` VARCHAR(191) NULL,
    `theaterId` VARCHAR(191) NULL,
    `status` ENUM('REQUESTED', 'SCHEDULED', 'PRE_OP', 'IN_PROGRESS', 'RECOVERY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `priority` ENUM('ELECTIVE', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'ELECTIVE',
    `scheduledStart` DATETIME(3) NOT NULL,
    `scheduledEnd` DATETIME(3) NOT NULL,
    `actualStart` DATETIME(3) NULL,
    `actualEnd` DATETIME(3) NULL,
    `preOpDiagnosis` TEXT NOT NULL,
    `postOpDiagnosis` TEXT NULL,
    `procedureName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `surgeries_patientId_idx`(`patientId`),
    INDEX `surgeries_status_idx`(`status`),
    INDEX `surgeries_scheduledStart_idx`(`scheduledStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surgery_team_members` (
    `id` VARCHAR(191) NOT NULL,
    `surgeryId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('LEAD_SURGEON', 'ASSISTANT_SURGEON', 'ANESTHESIOLOGIST', 'ANESTHETIST_NURSE', 'SCRUB_NURSE', 'CIRCULATING_NURSE', 'TECHNICIAN') NOT NULL,
    `notes` TEXT NULL,

    UNIQUE INDEX `surgery_team_members_surgeryId_userId_role_key`(`surgeryId`, `userId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surgery_checklists` (
    `id` VARCHAR(191) NOT NULL,
    `surgeryId` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `completedById` VARCHAR(191) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `surgery_checklists_surgeryId_idx`(`surgeryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anesthesia_records` (
    `id` VARCHAR(191) NOT NULL,
    `surgeryId` VARCHAR(191) NOT NULL,
    `anesthesiaType` ENUM('GENERAL', 'REGIONAL_SPINAL', 'REGIONAL_EPIDURAL', 'REGIONAL_NERVE_BLOCK', 'MAC', 'LOCAL', 'TOPICAL') NOT NULL,
    `asaStatus` ENUM('I', 'II', 'III', 'IV', 'V', 'VI', 'E') NOT NULL,
    `inductionTime` DATETIME(3) NULL,
    `emergenceTime` DATETIME(3) NULL,
    `airwayNotes` TEXT NULL,
    `medications` JSON NULL,
    `ivFluids` JSON NULL,
    `bloodProducts` JSON NULL,
    `complications` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `anesthesia_records_surgeryId_key`(`surgeryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operative_reports` (
    `id` VARCHAR(191) NOT NULL,
    `surgeryId` VARCHAR(191) NOT NULL,
    `surgeonId` VARCHAR(191) NOT NULL,
    `procedureDescription` TEXT NOT NULL,
    `findings` TEXT NULL,
    `woundClass` ENUM('CLEAN', 'CLEAN_CONTAMINATED', 'CONTAMINATED', 'DIRTY_INFECTED') NULL,
    `estimatedBloodLoss` INTEGER NULL,
    `specimensRemoved` TEXT NULL,
    `implantsInserted` TEXT NULL,
    `complications` TEXT NULL,
    `postOpInstructions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `operative_reports_surgeryId_key`(`surgeryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `encounters_admissionId_idx` ON `encounters`(`admissionId`);

-- AddForeignKey
ALTER TABLE `cardiology_electrophysiology` ADD CONSTRAINT `cardiology_electrophysiology_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_electrophysiology` ADD CONSTRAINT `cardiology_electrophysiology_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_electrophysiology` ADD CONSTRAINT `cardiology_electrophysiology_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_heart_failure` ADD CONSTRAINT `cardiology_heart_failure_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_heart_failure` ADD CONSTRAINT `cardiology_heart_failure_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cardiology_heart_failure` ADD CONSTRAINT `cardiology_heart_failure_visitId_fkey` FOREIGN KEY (`visitId`) REFERENCES `cardiology_visits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_visits` ADD CONSTRAINT `neurology_visits_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_visits` ADD CONSTRAINT `neurology_visits_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encounters` ADD CONSTRAINT `encounters_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `admissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_orders` ADD CONSTRAINT `clinical_orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_orders` ADD CONSTRAINT `clinical_orders_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_orders` ADD CONSTRAINT `clinical_orders_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_results` ADD CONSTRAINT `clinical_results_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `clinical_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clinical_results` ADD CONSTRAINT `clinical_results_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_orders` ADD CONSTRAINT `medication_orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_orders` ADD CONSTRAINT `medication_orders_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_orders` ADD CONSTRAINT `medication_orders_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_administrations` ADD CONSTRAINT `medication_administrations_medicationOrderId_fkey` FOREIGN KEY (`medicationOrderId`) REFERENCES `medication_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_administrations` ADD CONSTRAINT `medication_administrations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medication_administrations` ADD CONSTRAINT `medication_administrations_administeredById_fkey` FOREIGN KEY (`administeredById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wards` ADD CONSTRAINT `wards_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beds` ADD CONSTRAINT `beds_wardId_fkey` FOREIGN KEY (`wardId`) REFERENCES `wards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissions` ADD CONSTRAINT `admissions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissions` ADD CONSTRAINT `admissions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissions` ADD CONSTRAINT `admissions_wardId_fkey` FOREIGN KEY (`wardId`) REFERENCES `wards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissions` ADD CONSTRAINT `admissions_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `beds`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissions` ADD CONSTRAINT `admissions_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_encounterId_fkey` FOREIGN KEY (`encounterId`) REFERENCES `encounters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `claims` ADD CONSTRAINT `claims_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `claims` ADD CONSTRAINT `claims_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgeries` ADD CONSTRAINT `surgeries_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgeries` ADD CONSTRAINT `surgeries_admissionId_fkey` FOREIGN KEY (`admissionId`) REFERENCES `admissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgeries` ADD CONSTRAINT `surgeries_theaterId_fkey` FOREIGN KEY (`theaterId`) REFERENCES `operating_theaters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgery_team_members` ADD CONSTRAINT `surgery_team_members_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgery_team_members` ADD CONSTRAINT `surgery_team_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgery_checklists` ADD CONSTRAINT `surgery_checklists_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surgery_checklists` ADD CONSTRAINT `surgery_checklists_completedById_fkey` FOREIGN KEY (`completedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anesthesia_records` ADD CONSTRAINT `anesthesia_records_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operative_reports` ADD CONSTRAINT `operative_reports_surgeryId_fkey` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operative_reports` ADD CONSTRAINT `operative_reports_surgeonId_fkey` FOREIGN KEY (`surgeonId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
