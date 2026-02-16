-- CreateTable
CREATE TABLE `specialties` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `specialties_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_tests` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('HEMATOLOGY', 'CHEMISTRY', 'MICROBIOLOGY', 'SEROLOGY', 'IMMUNOLOGY', 'MOLECULAR', 'ENDOCRINOLOGY', 'TOXICOLOGY', 'URINALYSIS', 'COAGULATION', 'HISTOLOGY', 'CYTOLOGY', 'OTHER') NOT NULL,
    `description` TEXT NULL,
    `specimenType` ENUM('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'SWAB', 'TISSUE', 'FLUID', 'BONE_MARROW', 'OTHER') NOT NULL,
    `containerType` VARCHAR(191) NULL,
    `volumeRequired` DOUBLE NULL,
    `turnaroundTime` INTEGER NOT NULL DEFAULT 60,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `requiresFasting` BOOLEAN NOT NULL DEFAULT false,
    `specialInstructions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_tests_code_key`(`code`),
    INDEX `lab_tests_category_idx`(`category`),
    INDEX `lab_tests_specimenType_idx`(`specimenType`),
    INDEX `lab_tests_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_panels` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `test_panels_code_key`(`code`),
    INDEX `test_panels_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_test_panel_items` (
    `id` VARCHAR(191) NOT NULL,
    `panelId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lab_test_panel_items_panelId_idx`(`panelId`),
    INDEX `lab_test_panel_items_testId_idx`(`testId`),
    UNIQUE INDEX `lab_test_panel_items_panelId_testId_key`(`panelId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specimens` (
    `id` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `specimenType` ENUM('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'SWAB', 'TISSUE', 'FLUID', 'BONE_MARROW', 'OTHER') NOT NULL,
    `collectionTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `collectedById` VARCHAR(191) NULL,
    `collectionSite` VARCHAR(191) NULL,
    `volumeCollected` DOUBLE NULL,
    `collectionNotes` TEXT NULL,
    `receivedTime` DATETIME(3) NULL,
    `receivedById` VARCHAR(191) NULL,
    `receptionNotes` TEXT NULL,
    `status` ENUM('ORDERED', 'COLLECTED', 'RECEIVED', 'PROCESSING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'ORDERED',
    `rejectionReason` TEXT NULL,
    `storageLocation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `specimens_barcode_key`(`barcode`),
    INDEX `specimens_patientId_idx`(`patientId`),
    INDEX `specimens_barcode_idx`(`barcode`),
    INDEX `specimens_status_idx`(`status`),
    INDEX `specimens_collectionTime_idx`(`collectionTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_work_orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `specimenId` VARCHAR(191) NULL,
    `clinicalOrderId` VARCHAR(191) NULL,
    `testPanelId` VARCHAR(191) NULL,
    `orderedById` VARCHAR(191) NOT NULL,
    `orderedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `priority` ENUM('ROUTINE', 'URGENT', 'STAT') NOT NULL DEFAULT 'ROUTINE',
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `startTime` DATETIME(3) NULL,
    `completedTime` DATETIME(3) NULL,
    `verifiedById` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `cancelledById` VARCHAR(191) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancellationReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_work_orders_orderNumber_key`(`orderNumber`),
    INDEX `lab_work_orders_patientId_idx`(`patientId`),
    INDEX `lab_work_orders_specimenId_idx`(`specimenId`),
    INDEX `lab_work_orders_status_idx`(`status`),
    INDEX `lab_work_orders_orderedAt_idx`(`orderedAt`),
    INDEX `lab_work_orders_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_work_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `workOrderId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lab_work_order_items_workOrderId_idx`(`workOrderId`),
    INDEX `lab_work_order_items_testId_idx`(`testId`),
    UNIQUE INDEX `lab_work_order_items_workOrderId_testId_key`(`workOrderId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_results` (
    `id` VARCHAR(191) NOT NULL,
    `workOrderId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `numericValue` DOUBLE NULL,
    `unit` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PRELIMINARY', 'FINAL', 'AMENDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `flag` ENUM('NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH', 'BORDERLINE') NOT NULL DEFAULT 'NORMAL',
    `referenceRange` TEXT NULL,
    `interpretation` TEXT NULL,
    `technicianId` VARCHAR(191) NULL,
    `resultedAt` DATETIME(3) NULL,
    `reviewerId` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `instrumentId` VARCHAR(191) NULL,
    `method` VARCHAR(191) NULL,
    `dilution` DOUBLE NULL,
    `comments` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lab_results_workOrderId_idx`(`workOrderId`),
    INDEX `lab_results_testId_idx`(`testId`),
    INDEX `lab_results_patientId_idx`(`patientId`),
    INDEX `lab_results_status_idx`(`status`),
    INDEX `lab_results_flag_idx`(`flag`),
    INDEX `lab_results_resultedAt_idx`(`resultedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reference_ranges` (
    `id` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `ageMin` INTEGER NULL,
    `ageMax` INTEGER NULL,
    `lowValue` DOUBLE NULL,
    `highValue` DOUBLE NULL,
    `criticalLow` DOUBLE NULL,
    `criticalHigh` DOUBLE NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `referenceText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reference_ranges_testId_idx`(`testId`),
    INDEX `reference_ranges_gender_idx`(`gender`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_controls` (
    `id` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `lotNumber` VARCHAR(191) NOT NULL,
    `level` ENUM('NORMAL', 'ABNORMAL_LOW', 'ABNORMAL_HIGH') NOT NULL DEFAULT 'NORMAL',
    `targetValue` DOUBLE NOT NULL,
    `acceptableRange` DOUBLE NOT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `qc_controls_testId_idx`(`testId`),
    INDEX `qc_controls_isActive_idx`(`isActive`),
    INDEX `qc_controls_expiryDate_idx`(`expiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qc_results` (
    `id` VARCHAR(191) NOT NULL,
    `controlId` VARCHAR(191) NOT NULL,
    `instrumentId` VARCHAR(191) NULL,
    `resultValue` DOUBLE NOT NULL,
    `status` ENUM('PASS', 'FAIL', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `deviation` DOUBLE NULL,
    `runDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `technicianId` VARCHAR(191) NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `qc_results_controlId_idx`(`controlId`),
    INDEX `qc_results_runDate_idx`(`runDate`),
    INDEX `qc_results_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_eegs` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `recordedAt` DATETIME(3) NOT NULL,
    `durationMinutes` INTEGER NULL,
    `indication` TEXT NULL,
    `findings` TEXT NULL,
    `interpretation` TEXT NULL,
    `seizuresDetected` BOOLEAN NOT NULL DEFAULT false,
    `seizureCount` INTEGER NULL,
    `backgroundActivity` VARCHAR(191) NULL,
    `sleepArchitecture` VARCHAR(191) NULL,
    `photicStimulation` BOOLEAN NULL,
    `hyperventilation` BOOLEAN NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_eegs_patientId_idx`(`patientId`),
    INDEX `neurology_eegs_providerId_idx`(`providerId`),
    INDEX `neurology_eegs_recordedAt_idx`(`recordedAt`),
    INDEX `neurology_eegs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_emgs` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `indication` TEXT NULL,
    `musclesTested` TEXT NULL,
    `findings` TEXT NULL,
    `interpretation` TEXT NULL,
    `neuropathyPresent` BOOLEAN NULL,
    `myopathyPresent` BOOLEAN NULL,
    `conductionVelocity` DOUBLE NULL,
    `amplitude` DOUBLE NULL,
    `distalLatency` DOUBLE NULL,
    `fWaveLatency` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_emgs_patientId_idx`(`patientId`),
    INDEX `neurology_emgs_providerId_idx`(`providerId`),
    INDEX `neurology_emgs_performedAt_idx`(`performedAt`),
    INDEX `neurology_emgs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_imaging` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `visitId` VARCHAR(191) NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    `performedAt` DATETIME(3) NOT NULL,
    `imagingType` ENUM('CT_HEAD', 'CT_HEAD_WITH_CONTRAST', 'MRI_BRAIN', 'MRI_BRAIN_WITH_CONTRAST', 'CTA_HEAD', 'MRA_HEAD', 'PET_BRAIN', 'OTHER') NOT NULL,
    `indication` TEXT NULL,
    `findings` TEXT NULL,
    `impression` TEXT NULL,
    `acuteFindings` BOOLEAN NOT NULL DEFAULT false,
    `strokePresent` BOOLEAN NOT NULL DEFAULT false,
    `hemorrhagePresent` BOOLEAN NOT NULL DEFAULT false,
    `massPresent` BOOLEAN NOT NULL DEFAULT false,
    `contrastUsed` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_imaging_patientId_idx`(`patientId`),
    INDEX `neurology_imaging_providerId_idx`(`providerId`),
    INDEX `neurology_imaging_performedAt_idx`(`performedAt`),
    INDEX `neurology_imaging_status_idx`(`status`),
    INDEX `neurology_imaging_imagingType_idx`(`imagingType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_strokes` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `onsetTime` DATETIME(3) NOT NULL,
    `arrivalTime` DATETIME(3) NOT NULL,
    `strokeType` ENUM('ISCHEMIC', 'HEMORRHAGIC', 'TIA') NOT NULL,
    `severity` ENUM('MILD', 'MODERATE', 'SEVERE') NOT NULL,
    `nihssScore` INTEGER NOT NULL,
    `nihssDetails` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `ctDone` BOOLEAN NOT NULL DEFAULT false,
    `ctTime` DATETIME(3) NULL,
    `ctFindings` TEXT NULL,
    `mriDone` BOOLEAN NOT NULL DEFAULT false,
    `mriTime` DATETIME(3) NULL,
    `mriFindings` TEXT NULL,
    `thrombolysisGiven` BOOLEAN NOT NULL DEFAULT false,
    `thrombolysisTime` DATETIME(3) NULL,
    `thrombectomyDone` BOOLEAN NOT NULL DEFAULT false,
    `thrombectomyTime` DATETIME(3) NULL,
    `tpaDose` DOUBLE NULL,
    `bpManagement` TEXT NULL,
    `complications` TEXT NULL,
    `dischargeNihss` INTEGER NULL,
    `mrsAtDischarge` INTEGER NULL,
    `dischargeDisposition` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_strokes_patientId_idx`(`patientId`),
    INDEX `neurology_strokes_providerId_idx`(`providerId`),
    INDEX `neurology_strokes_onsetTime_idx`(`onsetTime`),
    INDEX `neurology_strokes_strokeType_idx`(`strokeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_seizures` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `eventTime` DATETIME(3) NOT NULL,
    `seizureType` ENUM('FOCAL_ONSET_AWARE', 'FOCAL_ONSET_IMPAIRED', 'GENERALIZED_TONIC_CLONIC', 'ABSENCE', 'MYOCLONIC', 'ATONIC', 'UNKNOWN', 'STATUS_EPILEPTICUS') NOT NULL,
    `durationSeconds` INTEGER NULL,
    `witnessed` BOOLEAN NOT NULL DEFAULT false,
    `witnessedBy` VARCHAR(191) NULL,
    `auraPresent` BOOLEAN NOT NULL DEFAULT false,
    `auraDescription` VARCHAR(191) NULL,
    `lossOfConsciousness` BOOLEAN NOT NULL DEFAULT false,
    `incontinence` BOOLEAN NOT NULL DEFAULT false,
    `tongueBite` BOOLEAN NOT NULL DEFAULT false,
    `postIctalConfusion` BOOLEAN NOT NULL DEFAULT false,
    `postIctalDuration` INTEGER NULL,
    `triggers` VARCHAR(191) NULL,
    `eegCorrelation` VARCHAR(191) NULL,
    `medicationChange` VARCHAR(191) NULL,
    `injurySustained` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_seizures_patientId_idx`(`patientId`),
    INDEX `neurology_seizures_providerId_idx`(`providerId`),
    INDEX `neurology_seizures_eventTime_idx`(`eventTime`),
    INDEX `neurology_seizures_seizureType_idx`(`seizureType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neurology_cognitive_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `mmseScore` INTEGER NULL,
    `mocaScore` INTEGER NULL,
    `clockDrawingTest` VARCHAR(191) NULL,
    `verbalFluencyScore` INTEGER NULL,
    `trailMakingA` INTEGER NULL,
    `trailMakingB` INTEGER NULL,
    `delayedRecall` INTEGER NULL,
    `attentionTest` VARCHAR(191) NULL,
    `languageAssessment` VARCHAR(191) NULL,
    `visuospatialScore` INTEGER NULL,
    `executiveFunction` VARCHAR(191) NULL,
    `overallImpression` TEXT NULL,
    `diagnosis` VARCHAR(191) NULL,
    `recommendations` TEXT NULL,
    `followUpNeeded` BOOLEAN NOT NULL DEFAULT false,
    `followUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `neurology_cognitive_assessments_patientId_idx`(`patientId`),
    INDEX `neurology_cognitive_assessments_providerId_idx`(`providerId`),
    INDEX `neurology_cognitive_assessments_assessmentDate_idx`(`assessmentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oncology_chemotherapy` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `protocolName` VARCHAR(191) NOT NULL,
    `cancerType` VARCHAR(191) NOT NULL,
    `cycleNumber` INTEGER NOT NULL,
    `totalCycles` INTEGER NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED', 'HELD') NOT NULL DEFAULT 'PLANNED',
    `scheduledDate` DATETIME(3) NOT NULL,
    `administeredDate` DATETIME(3) NULL,
    `premedications` TEXT NULL,
    `chemotherapyAgents` TEXT NULL,
    `doses` TEXT NULL,
    `route` VARCHAR(191) NULL,
    `durationHours` DOUBLE NULL,
    `tolerance` TEXT NULL,
    `sideEffects` TEXT NULL,
    `doseModifications` TEXT NULL,
    `nextCycleDate` DATETIME(3) NULL,
    `growthFactorGiven` BOOLEAN NOT NULL DEFAULT false,
    `labsReviewed` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `oncology_chemotherapy_patientId_idx`(`patientId`),
    INDEX `oncology_chemotherapy_providerId_idx`(`providerId`),
    INDEX `oncology_chemotherapy_scheduledDate_idx`(`scheduledDate`),
    INDEX `oncology_chemotherapy_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oncology_radiation` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `cancerType` VARCHAR(191) NOT NULL,
    `treatmentSite` VARCHAR(191) NOT NULL,
    `totalDoseGy` DOUBLE NOT NULL,
    `fractions` INTEGER NOT NULL,
    `dosePerFraction` DOUBLE NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED', 'HELD') NOT NULL DEFAULT 'PLANNED',
    `startDate` DATETIME(3) NULL,
    `completionDate` DATETIME(3) NULL,
    `fractionNumber` INTEGER NOT NULL DEFAULT 0,
    `technique` VARCHAR(191) NULL,
    `energy` VARCHAR(191) NULL,
    `simulationDate` DATETIME(3) NULL,
    `planningCtDate` DATETIME(3) NULL,
    `skinReactions` VARCHAR(191) NULL,
    `fatigueLevel` VARCHAR(191) NULL,
    `esophagitisGrade` VARCHAR(191) NULL,
    `otherSideEffects` TEXT NULL,
    `treatmentBreaks` INTEGER NULL,
    `breakReason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `oncology_radiation_patientId_idx`(`patientId`),
    INDEX `oncology_radiation_providerId_idx`(`providerId`),
    INDEX `oncology_radiation_startDate_idx`(`startDate`),
    INDEX `oncology_radiation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oncology_staging` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `cancerType` VARCHAR(191) NOT NULL,
    `histology` VARCHAR(191) NULL,
    `grade` VARCHAR(191) NULL,
    `tStage` VARCHAR(191) NULL,
    `nStage` VARCHAR(191) NULL,
    `mStage` VARCHAR(191) NULL,
    `overallStage` ENUM('STAGE_0', 'STAGE_I', 'STAGE_IA', 'STAGE_IB', 'STAGE_II', 'STAGE_IIA', 'STAGE_IIB', 'STAGE_III', 'STAGE_IIIA', 'STAGE_IIIB', 'STAGE_IIIC', 'STAGE_IV', 'UNKNOWN') NOT NULL,
    `stageGrouping` VARCHAR(191) NULL,
    `stagingDate` DATETIME(3) NOT NULL,
    `stagingMethod` VARCHAR(191) NULL,
    `tumorSizeCm` DOUBLE NULL,
    `nodesPositive` INTEGER NULL,
    `nodesExamined` INTEGER NULL,
    `metastasisSites` VARCHAR(191) NULL,
    `biomarkers` TEXT NULL,
    `stagingImaging` TEXT NULL,
    `pathologyReport` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `oncology_staging_patientId_idx`(`patientId`),
    INDEX `oncology_staging_providerId_idx`(`providerId`),
    INDEX `oncology_staging_stagingDate_idx`(`stagingDate`),
    INDEX `oncology_staging_cancerType_idx`(`cancerType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oncology_tumor_boards` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `presenterId` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `meetingDate` DATETIME(3) NOT NULL,
    `cancerType` VARCHAR(191) NOT NULL,
    `stage` VARCHAR(191) NULL,
    `casePresentation` TEXT NULL,
    `imagingReviewed` TEXT NULL,
    `pathologyReviewed` TEXT NULL,
    `molecularTesting` VARCHAR(191) NULL,
    `treatmentOptions` TEXT NULL,
    `recommendedPlan` TEXT NULL,
    `clinicalTrialOffered` BOOLEAN NOT NULL DEFAULT false,
    `trialName` VARCHAR(191) NULL,
    `attendees` TEXT NULL,
    `consensusReached` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `oncology_tumor_boards_patientId_idx`(`patientId`),
    INDEX `oncology_tumor_boards_presenterId_idx`(`presenterId`),
    INDEX `oncology_tumor_boards_meetingDate_idx`(`meetingDate`),
    INDEX `oncology_tumor_boards_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orthopedic_fractures` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `injuryDate` DATETIME(3) NOT NULL,
    `fractureType` ENUM('CLOSED', 'OPEN_GUSTILO_I', 'OPEN_GUSTILO_II', 'OPEN_GUSTILO_IIIA', 'OPEN_GUSTILO_IIIB', 'OPEN_GUSTILO_IIIC') NOT NULL,
    `bone` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `classification` VARCHAR(191) NULL,
    `displacement` VARCHAR(191) NULL,
    `angulation` DOUBLE NULL,
    `comminution` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACUTE', 'HEALING', 'HEALED', 'DELAYED_UNION', 'NON_UNION', 'MALUNION') NOT NULL DEFAULT 'ACUTE',
    `reductionPerformed` BOOLEAN NOT NULL DEFAULT false,
    `reductionDate` DATETIME(3) NULL,
    `fixationType` VARCHAR(191) NULL,
    `implantUsed` VARCHAR(191) NULL,
    `surgeryDate` DATETIME(3) NULL,
    `complications` TEXT NULL,
    `healingProgress` TEXT NULL,
    `followUpXrayDate` DATETIME(3) NULL,
    `weightBearingStatus` VARCHAR(191) NULL,
    `physicalTherapyStarted` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `orthopedic_fractures_patientId_idx`(`patientId`),
    INDEX `orthopedic_fractures_providerId_idx`(`providerId`),
    INDEX `orthopedic_fractures_injuryDate_idx`(`injuryDate`),
    INDEX `orthopedic_fractures_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orthopedic_joint_replacements` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `surgeryDate` DATETIME(3) NOT NULL,
    `jointType` ENUM('HIP', 'KNEE', 'SHOULDER', 'ELBOW', 'ANKLE', 'WRIST', 'OTHER') NOT NULL,
    `side` VARCHAR(191) NOT NULL,
    `approach` VARCHAR(191) NULL,
    `implantManufacturer` VARCHAR(191) NULL,
    `implantModel` VARCHAR(191) NULL,
    `implantSize` VARCHAR(191) NULL,
    `bearingSurface` VARCHAR(191) NULL,
    `fixation` VARCHAR(191) NULL,
    `anesthesiaType` VARCHAR(191) NULL,
    `tourniquetTime` INTEGER NULL,
    `estimatedBloodLoss` INTEGER NULL,
    `complications` TEXT NULL,
    `preOpHarrisHipScore` INTEGER NULL,
    `postOpHarrisHipScore` INTEGER NULL,
    `preOpKssScore` INTEGER NULL,
    `postOpKssScore` INTEGER NULL,
    `rangeOfMotion` VARCHAR(191) NULL,
    `infection` BOOLEAN NOT NULL DEFAULT false,
    `dislocation` BOOLEAN NOT NULL DEFAULT false,
    `revisionNeeded` BOOLEAN NOT NULL DEFAULT false,
    `revisionDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `orthopedic_joint_replacements_patientId_idx`(`patientId`),
    INDEX `orthopedic_joint_replacements_providerId_idx`(`providerId`),
    INDEX `orthopedic_joint_replacements_surgeryDate_idx`(`surgeryDate`),
    INDEX `orthopedic_joint_replacements_jointType_idx`(`jointType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orthopedic_physical_therapy` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `referralDate` DATETIME(3) NOT NULL,
    `diagnosis` VARCHAR(191) NOT NULL,
    `treatmentGoals` TEXT NULL,
    `sessionsPlanned` INTEGER NOT NULL,
    `sessionsCompleted` INTEGER NOT NULL DEFAULT 0,
    `currentStatus` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `modalities` VARCHAR(191) NULL,
    `therapeuticExercises` TEXT NULL,
    `gaitTraining` BOOLEAN NOT NULL DEFAULT false,
    `balanceTraining` BOOLEAN NOT NULL DEFAULT false,
    `strengthening` VARCHAR(191) NULL,
    `rangeOfMotion` VARCHAR(191) NULL,
    `functionalActivities` TEXT NULL,
    `painLevel` INTEGER NULL,
    `progressNotes` TEXT NULL,
    `nextSessionDate` DATETIME(3) NULL,
    `dischargeDate` DATETIME(3) NULL,
    `dischargeStatus` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `orthopedic_physical_therapy_patientId_idx`(`patientId`),
    INDEX `orthopedic_physical_therapy_providerId_idx`(`providerId`),
    INDEX `orthopedic_physical_therapy_referralDate_idx`(`referralDate`),
    INDEX `orthopedic_physical_therapy_currentStatus_idx`(`currentStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pulmonology_spirometry` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `testDate` DATETIME(3) NOT NULL,
    `indication` VARCHAR(191) NULL,
    `qualityGrade` ENUM('GOOD', 'FAIR', 'POOR', 'REJECTED') NOT NULL,
    `fev1` DOUBLE NOT NULL,
    `fvc` DOUBLE NOT NULL,
    `fev1FvcRatio` DOUBLE NOT NULL,
    `predictedFev1` DOUBLE NULL,
    `predictedFvc` DOUBLE NULL,
    `percentPredictedFev1` DOUBLE NULL,
    `percentPredictedFvc` DOUBLE NULL,
    `fef2575` DOUBLE NULL,
    `bronchodilatorGiven` BOOLEAN NOT NULL DEFAULT false,
    `postBdFev1` DOUBLE NULL,
    `postBdFvc` DOUBLE NULL,
    `postBdRatio` DOUBLE NULL,
    `significantResponse` BOOLEAN NOT NULL DEFAULT false,
    `interpretation` TEXT NULL,
    `diagnosis` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pulmonology_spirometry_patientId_idx`(`patientId`),
    INDEX `pulmonology_spirometry_providerId_idx`(`providerId`),
    INDEX `pulmonology_spirometry_testDate_idx`(`testDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pulmonology_sleep_studies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `studyDate` DATETIME(3) NOT NULL,
    `studyType` VARCHAR(191) NOT NULL,
    `ahi` DOUBLE NOT NULL,
    `rdi` DOUBLE NULL,
    `odi` DOUBLE NULL,
    `meanSpo2` DOUBLE NULL,
    `nadirSpo2` DOUBLE NULL,
    `timeBelow90` DOUBLE NULL,
    `sleepEfficiency` DOUBLE NULL,
    `totalSleepTime` INTEGER NULL,
    `remPercentage` DOUBLE NULL,
    `deepSleepPercentage` DOUBLE NULL,
    `apneaSeverity` ENUM('NONE', 'MILD', 'MODERATE', 'SEVERE') NOT NULL,
    `centralApneaIndex` DOUBLE NULL,
    `obstructiveApneaIndex` DOUBLE NULL,
    `hypopneaIndex` DOUBLE NULL,
    `cpapRecommended` BOOLEAN NOT NULL DEFAULT false,
    `cpapPressure` DOUBLE NULL,
    `bipapRecommended` BOOLEAN NOT NULL DEFAULT false,
    `bipapSettings` VARCHAR(191) NULL,
    `positionalTherapy` BOOLEAN NOT NULL DEFAULT false,
    `oralAppliance` BOOLEAN NOT NULL DEFAULT false,
    `surgicalEvaluation` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pulmonology_sleep_studies_patientId_idx`(`patientId`),
    INDEX `pulmonology_sleep_studies_providerId_idx`(`providerId`),
    INDEX `pulmonology_sleep_studies_studyDate_idx`(`studyDate`),
    INDEX `pulmonology_sleep_studies_apneaSeverity_idx`(`apneaSeverity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pulmonology_bronchoscopies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `procedureDate` DATETIME(3) NOT NULL,
    `indication` TEXT NOT NULL,
    `anesthesia` VARCHAR(191) NULL,
    `vocalCords` VARCHAR(191) NULL,
    `trachea` VARCHAR(191) NULL,
    `carina` VARCHAR(191) NULL,
    `rightMainBronchus` VARCHAR(191) NULL,
    `leftMainBronchus` VARCHAR(191) NULL,
    `lobarBranches` TEXT NULL,
    `segmentalBranches` TEXT NULL,
    `abnormalitiesFound` BOOLEAN NOT NULL DEFAULT false,
    `abnormalities` TEXT NULL,
    `biopsiesTaken` INTEGER NOT NULL DEFAULT 0,
    `biopsySites` VARCHAR(191) NULL,
    `balfPerformed` BOOLEAN NOT NULL DEFAULT false,
    `balSites` VARCHAR(191) NULL,
    `balResults` TEXT NULL,
    `brushingsTaken` BOOLEAN NOT NULL DEFAULT false,
    `complications` TEXT NULL,
    `postOpInstructions` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pulmonology_bronchoscopies_patientId_idx`(`patientId`),
    INDEX `pulmonology_bronchoscopies_providerId_idx`(`providerId`),
    INDEX `pulmonology_bronchoscopies_procedureDate_idx`(`procedureDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastro_endoscopies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `procedureDate` DATETIME(3) NOT NULL,
    `indication` TEXT NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `sedationType` VARCHAR(191) NULL,
    `scopeInsertion` VARCHAR(191) NULL,
    `esophagus` VARCHAR(191) NULL,
    `gastroesophagealJunction` VARCHAR(191) NULL,
    `stomach` TEXT NULL,
    `pylorus` VARCHAR(191) NULL,
    `duodenum` TEXT NULL,
    `mucosalAppearance` VARCHAR(191) NULL,
    `lesionsFound` BOOLEAN NOT NULL DEFAULT false,
    `lesionsDescription` TEXT NULL,
    `biopsiesTaken` INTEGER NOT NULL DEFAULT 0,
    `biopsySites` VARCHAR(191) NULL,
    `hemostasisPerformed` BOOLEAN NOT NULL DEFAULT false,
    `hemostasisMethod` VARCHAR(191) NULL,
    `polypectomy` BOOLEAN NOT NULL DEFAULT false,
    `polypsRemoved` INTEGER NOT NULL DEFAULT 0,
    `polypSizeMm` DOUBLE NULL,
    `complications` TEXT NULL,
    `recommendations` TEXT NULL,
    `followUpInterval` VARCHAR(191) NULL,
    `prepQuality` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR') NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `gastro_endoscopies_patientId_idx`(`patientId`),
    INDEX `gastro_endoscopies_providerId_idx`(`providerId`),
    INDEX `gastro_endoscopies_procedureDate_idx`(`procedureDate`),
    INDEX `gastro_endoscopies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastro_colonoscopies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `procedureDate` DATETIME(3) NOT NULL,
    `indication` TEXT NOT NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `sedationType` VARCHAR(191) NULL,
    `scopeInsertion` VARCHAR(191) NULL,
    `cecalIntubation` BOOLEAN NOT NULL DEFAULT false,
    `cecalIntubationTime` INTEGER NULL,
    `withdrawalTime` INTEGER NULL,
    `prepQuality` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR') NULL,
    `ileumExamined` BOOLEAN NOT NULL DEFAULT false,
    `mucosalAppearance` VARCHAR(191) NULL,
    `lesionsFound` BOOLEAN NOT NULL DEFAULT false,
    `lesionsDescription` TEXT NULL,
    `polypsFound` BOOLEAN NOT NULL DEFAULT false,
    `polypsRemoved` INTEGER NOT NULL DEFAULT 0,
    `polypSizeMaxMm` DOUBLE NULL,
    `polypHistology` VARCHAR(191) NULL,
    `biopsiesTaken` INTEGER NOT NULL DEFAULT 0,
    `biopsySites` VARCHAR(191) NULL,
    `hemostasisPerformed` BOOLEAN NOT NULL DEFAULT false,
    `complications` TEXT NULL,
    `recommendations` TEXT NULL,
    `followUpInterval` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `gastro_colonoscopies_patientId_idx`(`patientId`),
    INDEX `gastro_colonoscopies_providerId_idx`(`providerId`),
    INDEX `gastro_colonoscopies_procedureDate_idx`(`procedureDate`),
    INDEX `gastro_colonoscopies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastro_liver_function` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `testDate` DATETIME(3) NOT NULL,
    `alt` DOUBLE NULL,
    `ast` DOUBLE NULL,
    `alp` DOUBLE NULL,
    `ggt` DOUBLE NULL,
    `totalBilirubin` DOUBLE NULL,
    `directBilirubin` DOUBLE NULL,
    `indirectBilirubin` DOUBLE NULL,
    `totalProtein` DOUBLE NULL,
    `albumin` DOUBLE NULL,
    `globulin` DOUBLE NULL,
    `agRatio` DOUBLE NULL,
    `pt` DOUBLE NULL,
    `inr` DOUBLE NULL,
    `ptt` DOUBLE NULL,
    `fibroscanScore` DOUBLE NULL,
    `fibrosisStage` VARCHAR(191) NULL,
    `steatosisGrade` VARCHAR(191) NULL,
    `capScore` DOUBLE NULL,
    `diagnosis` VARCHAR(191) NULL,
    `interpretation` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `gastro_liver_function_patientId_idx`(`patientId`),
    INDEX `gastro_liver_function_testDate_idx`(`testDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endo_diabetes` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `diagnosisDate` DATETIME(3) NOT NULL,
    `diabetesType` ENUM('TYPE_1', 'TYPE_2', 'GESTATIONAL', 'LADA', 'MODY', 'SECONDARY', 'PREDIABETES') NOT NULL,
    `hba1cAtDiagnosis` DOUBLE NULL,
    `currentHbA1c` DOUBLE NULL,
    `hba1cDate` DATETIME(3) NULL,
    `fastingGlucose` DOUBLE NULL,
    `postprandialGlucose` DOUBLE NULL,
    `targetFasting` DOUBLE NOT NULL DEFAULT 80,
    `targetPostprandial` DOUBLE NOT NULL DEFAULT 140,
    `targetHbA1c` DOUBLE NOT NULL DEFAULT 7.0,
    `complications` TEXT NULL,
    `retinopathy` BOOLEAN NOT NULL DEFAULT false,
    `nephropathy` BOOLEAN NOT NULL DEFAULT false,
    `neuropathy` BOOLEAN NOT NULL DEFAULT false,
    `cardiovascular` BOOLEAN NOT NULL DEFAULT false,
    `footExamDate` DATETIME(3) NULL,
    `footExamFindings` VARCHAR(191) NULL,
    `eyeExamDate` DATETIME(3) NULL,
    `eyeExamFindings` VARCHAR(191) NULL,
    `lastNephrologyReferral` DATETIME(3) NULL,
    `dietitianReferral` BOOLEAN NOT NULL DEFAULT false,
    `diabetesEducator` BOOLEAN NOT NULL DEFAULT false,
    `selfMonitoring` BOOLEAN NOT NULL DEFAULT false,
    `monitoringFrequency` VARCHAR(191) NULL,
    `lifestyleModifications` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `endo_diabetes_patientId_idx`(`patientId`),
    INDEX `endo_diabetes_providerId_idx`(`providerId`),
    INDEX `endo_diabetes_diagnosisDate_idx`(`diagnosisDate`),
    INDEX `endo_diabetes_diabetesType_idx`(`diabetesType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endo_insulin` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `prescriptionDate` DATETIME(3) NOT NULL,
    `insulinType` ENUM('RAPID_ACTING', 'SHORT_ACTING', 'INTERMEDIATE', 'LONG_ACTING', 'ULTRA_LONG', 'PREMIXED') NOT NULL,
    `brandName` VARCHAR(191) NULL,
    `morningDose` DOUBLE NULL,
    `noonDose` DOUBLE NULL,
    `eveningDose` DOUBLE NULL,
    `bedtimeDose` DOUBLE NULL,
    `correctionFactor` DOUBLE NULL,
    `carbRatio` DOUBLE NULL,
    `basalRate` DOUBLE NULL,
    `siteRotation` VARCHAR(191) NULL,
    `storageInstructions` VARCHAR(191) NULL,
    `hypoglycemiaAwareness` BOOLEAN NOT NULL DEFAULT true,
    `glucagonAvailable` BOOLEAN NOT NULL DEFAULT false,
    `lastHbA1c` DOUBLE NULL,
    `adjustmentsMade` TEXT NULL,
    `sideEffects` VARCHAR(191) NULL,
    `adherence` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `endo_insulin_patientId_idx`(`patientId`),
    INDEX `endo_insulin_providerId_idx`(`providerId`),
    INDEX `endo_insulin_prescriptionDate_idx`(`prescriptionDate`),
    INDEX `endo_insulin_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endo_thyroid` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `testDate` DATETIME(3) NOT NULL,
    `tsh` DOUBLE NULL,
    `freeT3` DOUBLE NULL,
    `freeT4` DOUBLE NULL,
    `totalT3` DOUBLE NULL,
    `totalT4` DOUBLE NULL,
    `tpoAntibodies` DOUBLE NULL,
    `tgAntibodies` DOUBLE NULL,
    `thyroglobulin` DOUBLE NULL,
    `calcitonin` DOUBLE NULL,
    `diagnosis` VARCHAR(191) NULL,
    `thyroidSize` VARCHAR(191) NULL,
    `nodulesPresent` BOOLEAN NOT NULL DEFAULT false,
    `noduleDescription` VARCHAR(191) NULL,
    `biopsyRecommended` BOOLEAN NOT NULL DEFAULT false,
    `biopsyResults` TEXT NULL,
    `medication` VARCHAR(191) NULL,
    `dose` VARCHAR(191) NULL,
    `targetTsh` DOUBLE NULL,
    `symptoms` TEXT NULL,
    `followUpNeeded` BOOLEAN NOT NULL DEFAULT true,
    `followUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `endo_thyroid_patientId_idx`(`patientId`),
    INDEX `endo_thyroid_providerId_idx`(`providerId`),
    INDEX `endo_thyroid_testDate_idx`(`testDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obgyn_pregnancies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `lmpDate` DATETIME(3) NOT NULL,
    `eddDate` DATETIME(3) NOT NULL,
    `gestationalAgeWeeks` INTEGER NOT NULL DEFAULT 0,
    `gravida` INTEGER NOT NULL,
    `para` INTEGER NOT NULL,
    `abortions` INTEGER NOT NULL,
    `livingChildren` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'MISCARRIAGE', 'TERMINATED', 'ECTOPIC', 'MOLAR') NOT NULL DEFAULT 'ACTIVE',
    `conceptionMethod` VARCHAR(191) NULL,
    `ivfCycleNumber` VARCHAR(191) NULL,
    `multipleGestation` BOOLEAN NOT NULL DEFAULT false,
    `numberOfFetuses` INTEGER NOT NULL DEFAULT 1,
    `riskFactors` TEXT NULL,
    `previousCesarean` INTEGER NOT NULL DEFAULT 0,
    `rhStatus` VARCHAR(191) NULL,
    `rubellaStatus` VARCHAR(191) NULL,
    `hepatitisBStatus` VARCHAR(191) NULL,
    `hivStatus` VARCHAR(191) NULL,
    `syphilisStatus` VARCHAR(191) NULL,
    `gbsStatus` VARCHAR(191) NULL,
    `initialWeight` DOUBLE NULL,
    `initialBmi` DOUBLE NULL,
    `preExistingConditions` TEXT NULL,
    `currentMedications` TEXT NULL,
    `allergies` TEXT NULL,
    `deliveryDate` DATETIME(3) NULL,
    `deliveryMode` ENUM('VAGINAL_SPONTANEOUS', 'VAGINAL_ASSISTED_VACUUM', 'VAGINAL_ASSISTED_FORCEPS', 'CESAREAN_ELECTIVE', 'CESAREAN_EMERGENCY') NULL,
    `deliveryOutcome` VARCHAR(191) NULL,
    `babyWeightGrams` INTEGER NULL,
    `babyApgar1` INTEGER NULL,
    `babyApgar5` INTEGER NULL,
    `babyApgar10` INTEGER NULL,
    `complications` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `obgyn_pregnancies_patientId_idx`(`patientId`),
    INDEX `obgyn_pregnancies_providerId_idx`(`providerId`),
    INDEX `obgyn_pregnancies_eddDate_idx`(`eddDate`),
    INDEX `obgyn_pregnancies_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obgyn_antenatal` (
    `id` VARCHAR(191) NOT NULL,
    `pregnancyId` VARCHAR(191) NOT NULL,
    `visitDate` DATETIME(3) NOT NULL,
    `gestationalAgeWeeks` INTEGER NOT NULL,
    `trimester` ENUM('FIRST', 'SECOND', 'THIRD') NOT NULL,
    `weight` DOUBLE NULL,
    `bloodPressure` VARCHAR(191) NULL,
    `fundalHeight` DOUBLE NULL,
    `fetalHeartRate` INTEGER NULL,
    `fetalMovement` BOOLEAN NULL,
    `presentation` VARCHAR(191) NULL,
    `edema` VARCHAR(191) NULL,
    `proteinuria` VARCHAR(191) NULL,
    `glucosuria` VARCHAR(191) NULL,
    `hemoglobin` DOUBLE NULL,
    `ultrasoundFindings` TEXT NULL,
    `screeningTests` TEXT NULL,
    `medications` VARCHAR(191) NULL,
    `complaints` TEXT NULL,
    `nextVisitDate` DATETIME(3) NULL,
    `riskAssessment` VARCHAR(191) NULL,
    `referralNeeded` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `obgyn_antenatal_pregnancyId_idx`(`pregnancyId`),
    INDEX `obgyn_antenatal_visitDate_idx`(`visitDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obgyn_deliveries` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL,
    `admissionTime` DATETIME(3) NOT NULL,
    `deliveryTime` DATETIME(3) NOT NULL,
    `deliveryMode` ENUM('VAGINAL_SPONTANEOUS', 'VAGINAL_ASSISTED_VACUUM', 'VAGINAL_ASSISTED_FORCEPS', 'CESAREAN_ELECTIVE', 'CESAREAN_EMERGENCY') NOT NULL,
    `gestationalAgeWeeks` INTEGER NOT NULL,
    `laborOnset` VARCHAR(191) NULL,
    `membranesRuptured` DATETIME(3) NULL,
    `fluidColor` VARCHAR(191) NULL,
    `inductionPerformed` BOOLEAN NOT NULL DEFAULT false,
    `inductionMethod` VARCHAR(191) NULL,
    `augmentation` BOOLEAN NOT NULL DEFAULT false,
    `anesthesia` VARCHAR(191) NULL,
    `secondStageDuration` INTEGER NULL,
    `episiotomy` BOOLEAN NOT NULL DEFAULT false,
    `laceration` VARCHAR(191) NULL,
    `estimatedBloodLoss` INTEGER NULL,
    `placentaDelivery` VARCHAR(191) NULL,
    `placentaComplete` BOOLEAN NOT NULL DEFAULT true,
    `babyWeightGrams` INTEGER NOT NULL,
    `babyLengthCm` DOUBLE NULL,
    `babyHeadCircumferenceCm` DOUBLE NULL,
    `babyGender` VARCHAR(191) NOT NULL,
    `babyApgar1` INTEGER NOT NULL,
    `babyApgar5` INTEGER NOT NULL,
    `babyApgar10` INTEGER NULL,
    `resuscitationNeeded` BOOLEAN NOT NULL DEFAULT false,
    `resuscitationDetails` VARCHAR(191) NULL,
    `nicuAdmission` BOOLEAN NOT NULL DEFAULT false,
    `nicuReason` VARCHAR(191) NULL,
    `maternalComplications` TEXT NULL,
    `postpartumHb` DOUBLE NULL,
    `rhogamGiven` BOOLEAN NOT NULL DEFAULT false,
    `dischargeDate` DATETIME(3) NULL,
    `breastfeedingEstablished` BOOLEAN NOT NULL DEFAULT false,
    `contraceptionCounseling` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `obgyn_deliveries_patientId_idx`(`patientId`),
    INDEX `obgyn_deliveries_providerId_idx`(`providerId`),
    INDEX `obgyn_deliveries_deliveryDate_idx`(`deliveryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peds_growth_charts` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `measurementDate` DATETIME(3) NOT NULL,
    `ageMonths` INTEGER NOT NULL,
    `weightKg` DOUBLE NOT NULL,
    `heightCm` DOUBLE NOT NULL,
    `headCircumferenceCm` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `weightPercentile` DOUBLE NULL,
    `heightPercentile` DOUBLE NULL,
    `bmiPercentile` DOUBLE NULL,
    `headCircPercentile` DOUBLE NULL,
    `weightForLength` DOUBLE NULL,
    `growthVelocity` VARCHAR(191) NULL,
    `nutritionalStatus` VARCHAR(191) NULL,
    `zScoreWeight` DOUBLE NULL,
    `zScoreHeight` DOUBLE NULL,
    `plotOnWhoChart` BOOLEAN NOT NULL DEFAULT true,
    `plotOnCdcChart` BOOLEAN NOT NULL DEFAULT false,
    `prematureCorrection` BOOLEAN NOT NULL DEFAULT false,
    `weeksPremature` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `peds_growth_charts_patientId_idx`(`patientId`),
    INDEX `peds_growth_charts_providerId_idx`(`providerId`),
    INDEX `peds_growth_charts_measurementDate_idx`(`measurementDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peds_vaccinations` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `vaccineName` VARCHAR(191) NOT NULL,
    `vaccineCode` VARCHAR(191) NULL,
    `doseNumber` INTEGER NOT NULL,
    `totalDoses` INTEGER NOT NULL,
    `dateGiven` DATETIME(3) NOT NULL,
    `ageAtVaccination` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `route` VARCHAR(191) NULL,
    `lotNumber` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `expirationDate` DATETIME(3) NULL,
    `sideEffects` VARCHAR(191) NULL,
    `contraindications` VARCHAR(191) NULL,
    `catchUpSchedule` BOOLEAN NOT NULL DEFAULT false,
    `dueDate` DATETIME(3) NULL,
    `nextDoseDue` DATETIME(3) NULL,
    `administeredBy` VARCHAR(191) NULL,
    `consentSigned` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `peds_vaccinations_patientId_idx`(`patientId`),
    INDEX `peds_vaccinations_providerId_idx`(`providerId`),
    INDEX `peds_vaccinations_vaccineName_idx`(`vaccineName`),
    INDEX `peds_vaccinations_dateGiven_idx`(`dateGiven`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peds_developmental` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `ageMonths` INTEGER NOT NULL,
    `grossMotor` TEXT NULL,
    `fineMotor` TEXT NULL,
    `language` TEXT NULL,
    `socialEmotional` TEXT NULL,
    `cognitive` TEXT NULL,
    `problemSolving` TEXT NULL,
    `personalSocial` TEXT NULL,
    `concernsIdentified` BOOLEAN NOT NULL DEFAULT false,
    `concernsDescription` TEXT NULL,
    `milestonesAchieved` TEXT NULL,
    `milestonesDelayed` TEXT NULL,
    `asqCompleted` BOOLEAN NOT NULL DEFAULT false,
    `asqScore` VARCHAR(191) NULL,
    `mchatCompleted` BOOLEAN NOT NULL DEFAULT false,
    `mchatScore` INTEGER NULL,
    `autismScreenPositive` BOOLEAN NOT NULL DEFAULT false,
    `earlyInterventionReferral` BOOLEAN NOT NULL DEFAULT false,
    `speechTherapyReferral` BOOLEAN NOT NULL DEFAULT false,
    `occupationalTherapyReferral` BOOLEAN NOT NULL DEFAULT false,
    `hearingTestDone` BOOLEAN NOT NULL DEFAULT false,
    `visionTestDone` BOOLEAN NOT NULL DEFAULT false,
    `followUpNeeded` BOOLEAN NOT NULL DEFAULT false,
    `followUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `peds_developmental_patientId_idx`(`patientId`),
    INDEX `peds_developmental_providerId_idx`(`providerId`),
    INDEX `peds_developmental_assessmentDate_idx`(`assessmentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `psychiatry_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `assessmentType` ENUM('INITIAL', 'FOLLOW_UP', 'CRISIS', 'DISCHARGE', 'ANNUAL', 'PRE_ADMISSION', 'FORENSIC') NOT NULL,
    `chiefComplaint` TEXT NOT NULL,
    `historyOfPresentIllness` TEXT NULL,
    `pastPsychiatricHistory` TEXT NULL,
    `pastMedicalHistory` TEXT NULL,
    `familyHistory` TEXT NULL,
    `socialHistory` TEXT NULL,
    `substanceUseHistory` TEXT NULL,
    `currentMedications` TEXT NULL,
    `allergies` VARCHAR(191) NULL,
    `reviewOfSystems` TEXT NULL,
    `mentalStatusExam` TEXT NULL,
    `appearance` VARCHAR(191) NULL,
    `behavior` VARCHAR(191) NULL,
    `speech` VARCHAR(191) NULL,
    `mood` VARCHAR(191) NULL,
    `affect` VARCHAR(191) NULL,
    `thoughtProcess` VARCHAR(191) NULL,
    `thoughtContent` VARCHAR(191) NULL,
    `perceptions` VARCHAR(191) NULL,
    `cognition` VARCHAR(191) NULL,
    `insight` VARCHAR(191) NULL,
    `judgment` VARCHAR(191) NULL,
    `phq9Score` INTEGER NULL,
    `gad7Score` INTEGER NULL,
    `mdqScore` INTEGER NULL,
    `pcptsdScore` INTEGER NULL,
    `c_ssrsScore` INTEGER NULL,
    `riskAssessment` TEXT NULL,
    `suicidalIdeation` BOOLEAN NOT NULL DEFAULT false,
    `suicidalPlan` BOOLEAN NOT NULL DEFAULT false,
    `suicidalIntent` BOOLEAN NOT NULL DEFAULT false,
    `homicidalIdeation` BOOLEAN NOT NULL DEFAULT false,
    `selfHarmBehaviors` BOOLEAN NOT NULL DEFAULT false,
    `diagnosisPrimary` VARCHAR(191) NULL,
    `diagnosisSecondary` VARCHAR(191) NULL,
    `diagnosisCodes` VARCHAR(191) NULL,
    `formulation` TEXT NULL,
    `plan` TEXT NULL,
    `medicationsStarted` TEXT NULL,
    `psychotherapyRecommended` BOOLEAN NOT NULL DEFAULT false,
    `therapyType` VARCHAR(191) NULL,
    `followUpInterval` VARCHAR(191) NULL,
    `urgentFollowUp` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `psychiatry_assessments_patientId_idx`(`patientId`),
    INDEX `psychiatry_assessments_providerId_idx`(`providerId`),
    INDEX `psychiatry_assessments_assessmentDate_idx`(`assessmentDate`),
    INDEX `psychiatry_assessments_assessmentType_idx`(`assessmentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `psychiatry_therapy` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `sessionDate` DATETIME(3) NOT NULL,
    `therapyType` ENUM('INDIVIDUAL', 'GROUP', 'FAMILY', 'COUPLES', 'COGNITIVE_BEHAVIORAL', 'DIALECTICAL_BEHAVIORAL', 'PSYCHODYNAMIC', 'SUPPORTIVE', 'EXPOSURE') NOT NULL,
    `sessionNumber` INTEGER NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 50,
    `subjective` TEXT NULL,
    `objective` TEXT NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `interventionsUsed` TEXT NULL,
    `homeworkAssigned` TEXT NULL,
    `progressNotes` TEXT NULL,
    `moodRating` INTEGER NULL,
    `anxietyRating` INTEGER NULL,
    `functioningLevel` VARCHAR(191) NULL,
    `goalsDiscussed` TEXT NULL,
    `barriersIdentified` TEXT NULL,
    `copingStrategies` TEXT NULL,
    `crisisPlanReviewed` BOOLEAN NOT NULL DEFAULT false,
    `medicationAdherence` VARCHAR(191) NULL,
    `sideEffectsDiscussed` BOOLEAN NOT NULL DEFAULT false,
    `patientEngagement` VARCHAR(191) NULL,
    `nextSessionDate` DATETIME(3) NULL,
    `noShow` BOOLEAN NOT NULL DEFAULT false,
    `cancellationReason` VARCHAR(191) NULL,
    `urgentIssues` TEXT NULL,
    `safetyPlanUpdated` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `psychiatry_therapy_patientId_idx`(`patientId`),
    INDEX `psychiatry_therapy_providerId_idx`(`providerId`),
    INDEX `psychiatry_therapy_sessionDate_idx`(`sessionDate`),
    INDEX `psychiatry_therapy_therapyType_idx`(`therapyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `psychiatry_medication` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `medicationName` VARCHAR(191) NOT NULL,
    `genericName` VARCHAR(191) NULL,
    `dose` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `route` VARCHAR(191) NULL,
    `indication` VARCHAR(191) NULL,
    `startedDate` DATETIME(3) NULL,
    `prescribedBy` VARCHAR(191) NULL,
    `adherenceRating` INTEGER NULL,
    `adherenceBarriers` TEXT NULL,
    `effectivenessRating` INTEGER NULL,
    `sideEffectsPresent` BOOLEAN NOT NULL DEFAULT false,
    `sideEffects` TEXT NULL,
    `sideEffectSeverity` VARCHAR(191) NULL,
    `weightChanges` DOUBLE NULL,
    `sedationLevel` VARCHAR(191) NULL,
    `akathisiaPresent` BOOLEAN NOT NULL DEFAULT false,
    `tremorPresent` BOOLEAN NOT NULL DEFAULT false,
    `bloodWorkNeeded` BOOLEAN NOT NULL DEFAULT false,
    `lastClozapineLevel` DOUBLE NULL,
    `lastLithiumLevel` DOUBLE NULL,
    `lastValproateLevel` DOUBLE NULL,
    `ecgNeeded` BOOLEAN NOT NULL DEFAULT false,
    `metabolicMonitoring` BOOLEAN NOT NULL DEFAULT false,
    `changesMade` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `psychiatry_medication_patientId_idx`(`patientId`),
    INDEX `psychiatry_medication_providerId_idx`(`providerId`),
    INDEX `psychiatry_medication_assessmentDate_idx`(`assessmentDate`),
    INDEX `psychiatry_medication_medicationName_idx`(`medicationName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `derm_lesions` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `dateNoted` DATETIME(3) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `lesionType` ENUM('MACULE', 'PAPULE', 'PLAQUE', 'NODULE', 'TUMOR', 'VESICLE', 'BULLA', 'PUSTULE', 'WHEAL', 'CYST', 'ULCER', 'EROSION', 'SCALE', 'CRUST', 'SCAR', 'EXCORIATION') NOT NULL,
    `sizeMm` DOUBLE NOT NULL,
    `color` VARCHAR(191) NULL,
    `shape` VARCHAR(191) NULL,
    `border` VARCHAR(191) NULL,
    `symmetry` VARCHAR(191) NULL,
    `elevation` VARCHAR(191) NULL,
    `surface` VARCHAR(191) NULL,
    `surroundingSkin` VARCHAR(191) NULL,
    `symptoms` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `changes` VARCHAR(191) NULL,
    `previousTrauma` BOOLEAN NOT NULL DEFAULT false,
    `familyHistory` VARCHAR(191) NULL,
    `personalHistory` VARCHAR(191) NULL,
    `sunExposure` VARCHAR(191) NULL,
    `abcdScore` INTEGER NULL,
    `sevenPointChecklist` INTEGER NULL,
    `dermoscopyUsed` BOOLEAN NOT NULL DEFAULT false,
    `dermoscopyFindings` TEXT NULL,
    `photographyDone` BOOLEAN NOT NULL DEFAULT false,
    `suspiciousFeatures` TEXT NULL,
    `biopsyRecommended` BOOLEAN NOT NULL DEFAULT false,
    `biopsyType` ENUM('SHAVE', 'PUNCH', 'EXCISIONAL', 'INCISIONAL', 'WEDGE', 'MOHS') NULL,
    `diagnosisClinical` VARCHAR(191) NULL,
    `management` TEXT NULL,
    `followUpWeeks` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `derm_lesions_patientId_idx`(`patientId`),
    INDEX `derm_lesions_providerId_idx`(`providerId`),
    INDEX `derm_lesions_dateNoted_idx`(`dateNoted`),
    INDEX `derm_lesions_lesionType_idx`(`lesionType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `derm_biopsies` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `biopsyDate` DATETIME(3) NOT NULL,
    `lesionId` VARCHAR(191) NULL,
    `location` VARCHAR(191) NOT NULL,
    `biopsyType` ENUM('SHAVE', 'PUNCH', 'EXCISIONAL', 'INCISIONAL', 'WEDGE', 'MOHS') NOT NULL,
    `localAnesthetic` VARCHAR(191) NOT NULL DEFAULT 'Lidocaine 1%',
    `sutureType` VARCHAR(191) NULL,
    `sutureCount` INTEGER NULL,
    `specimenLabel` VARCHAR(191) NOT NULL,
    `sentToPathology` BOOLEAN NOT NULL DEFAULT true,
    `pathologyLab` VARCHAR(191) NULL,
    `clinicalImpression` TEXT NULL,
    `differentialDiagnosis` TEXT NULL,
    `woundCareInstructions` TEXT NULL,
    `sutureRemovalDate` DATETIME(3) NULL,
    `complications` TEXT NULL,
    `pathologyReceived` BOOLEAN NOT NULL DEFAULT false,
    `pathologyReportDate` DATETIME(3) NULL,
    `pathologicDiagnosis` TEXT NULL,
    `histology` TEXT NULL,
    `margins` VARCHAR(191) NULL,
    `depthMm` DOUBLE NULL,
    `ulcerationPresent` BOOLEAN NOT NULL DEFAULT false,
    `mitoticRate` VARCHAR(191) NULL,
    `breslowDepth` DOUBLE NULL,
    `clarkLevel` INTEGER NULL,
    `tnmStage` VARCHAR(191) NULL,
    `furtherTreatment` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `derm_biopsies_patientId_idx`(`patientId`),
    INDEX `derm_biopsies_providerId_idx`(`providerId`),
    INDEX `derm_biopsies_biopsyDate_idx`(`biopsyDate`),
    INDEX `derm_biopsies_biopsyType_idx`(`biopsyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ophth_exams` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `chiefComplaint` TEXT NULL,
    `history` TEXT NULL,
    `lastExam` DATETIME(3) NULL,
    `visualAcuityRight` VARCHAR(191) NULL,
    `visualAcuityLeft` VARCHAR(191) NULL,
    `bestCorrectedRight` VARCHAR(191) NULL,
    `bestCorrectedLeft` VARCHAR(191) NULL,
    `pinholeRight` VARCHAR(191) NULL,
    `pinholeLeft` VARCHAR(191) NULL,
    `nearVisionRight` VARCHAR(191) NULL,
    `nearVisionLeft` VARCHAR(191) NULL,
    `iopRight` DOUBLE NULL,
    `iopLeft` DOUBLE NULL,
    `iopMethod` VARCHAR(191) NULL,
    `pupils` VARCHAR(191) NULL,
    `extraocularMotility` VARCHAR(191) NULL,
    `confrontationFields` VARCHAR(191) NULL,
    `externalExam` TEXT NULL,
    `slitLampExam` TEXT NULL,
    `anteriorSegment` TEXT NULL,
    `lens` TEXT NULL,
    `vitreous` TEXT NULL,
    `fundusExam` TEXT NULL,
    `opticNerve` TEXT NULL,
    `macula` TEXT NULL,
    `vessels` TEXT NULL,
    `periphery` TEXT NULL,
    `gonioscopy` TEXT NULL,
    `refractionRight` VARCHAR(191) NULL,
    `refractionLeft` VARCHAR(191) NULL,
    `diagnosis` TEXT NULL,
    `plan` TEXT NULL,
    `glassesPrescribed` BOOLEAN NOT NULL DEFAULT false,
    `medicationPrescribed` TEXT NULL,
    `followUpWeeks` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ophth_exams_patientId_idx`(`patientId`),
    INDEX `ophth_exams_providerId_idx`(`providerId`),
    INDEX `ophth_exams_examDate_idx`(`examDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ophth_visual_acuity` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `testDate` DATETIME(3) NOT NULL,
    `eyeSide` ENUM('RIGHT', 'LEFT', 'BOTH') NOT NULL,
    `distanceUncorrected` VARCHAR(191) NULL,
    `distanceCorrected` VARCHAR(191) NULL,
    `nearUncorrected` VARCHAR(191) NULL,
    `nearCorrected` VARCHAR(191) NULL,
    `pinhole` VARCHAR(191) NULL,
    `lensPower` VARCHAR(191) NULL,
    `snellenFraction` VARCHAR(191) NULL,
    `logmarScore` DOUBLE NULL,
    `etdrsLetters` INTEGER NULL,
    `contrastSensitivity` VARCHAR(191) NULL,
    `colorVision` VARCHAR(191) NULL,
    `amslerGrid` VARCHAR(191) NULL,
    `amslerAbnormal` BOOLEAN NOT NULL DEFAULT false,
    `redDesaturation` BOOLEAN NOT NULL DEFAULT false,
    `diagnosis` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ophth_visual_acuity_patientId_idx`(`patientId`),
    INDEX `ophth_visual_acuity_providerId_idx`(`providerId`),
    INDEX `ophth_visual_acuity_testDate_idx`(`testDate`),
    INDEX `ophth_visual_acuity_eyeSide_idx`(`eyeSide`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ophth_fundus` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `examDate` DATETIME(3) NOT NULL,
    `eyeSide` ENUM('RIGHT', 'LEFT', 'BOTH') NOT NULL,
    `dilationUsed` VARCHAR(191) NULL,
    `cupDiscRatio` DOUBLE NULL,
    `neuroretinalRim` VARCHAR(191) NULL,
    `discColor` VARCHAR(191) NULL,
    `discMargins` VARCHAR(191) NULL,
    `peripapillaryAtrophy` VARCHAR(191) NULL,
    `vesselAppearance` VARCHAR(191) NULL,
    `avRatio` VARCHAR(191) NULL,
    `nipping` BOOLEAN NOT NULL DEFAULT false,
    `crossingChanges` BOOLEAN NOT NULL DEFAULT false,
    `maculaAppearance` TEXT NULL,
    `fovealReflex` BOOLEAN NOT NULL DEFAULT true,
    `drusenPresent` BOOLEAN NOT NULL DEFAULT false,
    `drusenDescription` VARCHAR(191) NULL,
    `hemorrhages` BOOLEAN NOT NULL DEFAULT false,
    `hemorrhageDescription` VARCHAR(191) NULL,
    `exudates` BOOLEAN NOT NULL DEFAULT false,
    `exudateType` VARCHAR(191) NULL,
    `cottonWoolSpots` BOOLEAN NOT NULL DEFAULT false,
    `microaneurysms` BOOLEAN NOT NULL DEFAULT false,
    `neovascularization` BOOLEAN NOT NULL DEFAULT false,
    `retinalDetachment` BOOLEAN NOT NULL DEFAULT false,
    `tearsOrHoles` BOOLEAN NOT NULL DEFAULT false,
    `latticeDegeneration` BOOLEAN NOT NULL DEFAULT false,
    `peripheralPathology` TEXT NULL,
    `diabeticRetinopathy` VARCHAR(191) NULL,
    `hypertensiveChanges` VARCHAR(191) NULL,
    `amdSeverity` VARCHAR(191) NULL,
    `glaucomaSuspect` BOOLEAN NOT NULL DEFAULT false,
    `photosTaken` BOOLEAN NOT NULL DEFAULT false,
    `octRecommended` BOOLEAN NOT NULL DEFAULT false,
    `faRecommended` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ophth_fundus_patientId_idx`(`patientId`),
    INDEX `ophth_fundus_providerId_idx`(`providerId`),
    INDEX `ophth_fundus_examDate_idx`(`examDate`),
    INDEX `ophth_fundus_eyeSide_idx`(`eyeSide`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ent_audiometry` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NULL,
    `testDate` DATETIME(3) NOT NULL,
    `testType` VARCHAR(191) NOT NULL DEFAULT 'Pure Tone Audiometry',
    `right250Hz` INTEGER NULL,
    `right500Hz` INTEGER NULL,
    `right1000Hz` INTEGER NULL,
    `right2000Hz` INTEGER NULL,
    `right4000Hz` INTEGER NULL,
    `right8000Hz` INTEGER NULL,
    `left250Hz` INTEGER NULL,
    `left500Hz` INTEGER NULL,
    `left1000Hz` INTEGER NULL,
    `left2000Hz` INTEGER NULL,
    `left4000Hz` INTEGER NULL,
    `left8000Hz` INTEGER NULL,
    `rightPta4` DOUBLE NULL,
    `leftPta4` DOUBLE NULL,
    `rightPta3` DOUBLE NULL,
    `leftPta3` DOUBLE NULL,
    `rightSpeechReceptionThreshold` INTEGER NULL,
    `leftSpeechReceptionThreshold` INTEGER NULL,
    `rightSpeechDiscrimination` INTEGER NULL,
    `leftSpeechDiscrimination` INTEGER NULL,
    `rightHearingLossType` ENUM('CONDUCTIVE', 'SENSORINEURAL', 'MIXED', 'NORMAL') NULL,
    `leftHearingLossType` ENUM('CONDUCTIVE', 'SENSORINEURAL', 'MIXED', 'NORMAL') NULL,
    `rightHearingLossDegree` VARCHAR(191) NULL,
    `leftHearingLossDegree` VARCHAR(191) NULL,
    `tympanogramRight` VARCHAR(191) NULL,
    `tympanogramLeft` VARCHAR(191) NULL,
    `acousticReflexRight` VARCHAR(191) NULL,
    `acousticReflexLeft` VARCHAR(191) NULL,
    `oaeRight` VARCHAR(191) NULL,
    `oaeLeft` VARCHAR(191) NULL,
    `abrRecommended` BOOLEAN NOT NULL DEFAULT false,
    `hearingAidRecommended` BOOLEAN NOT NULL DEFAULT false,
    `hearingAidType` VARCHAR(191) NULL,
    `followUpNeeded` BOOLEAN NOT NULL DEFAULT false,
    `followUpDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ent_audiometry_patientId_idx`(`patientId`),
    INDEX `ent_audiometry_providerId_idx`(`providerId`),
    INDEX `ent_audiometry_testDate_idx`(`testDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ent_nasal_endoscopy` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `procedureDate` DATETIME(3) NOT NULL,
    `indication` TEXT NOT NULL,
    `anesthesia` VARCHAR(191) NULL DEFAULT 'Topical lidocaine 4%',
    `nasalSeptum` VARCHAR(191) NULL,
    `turbinates` TEXT NULL,
    `meatus` VARCHAR(191) NULL,
    `nasalPolyps` BOOLEAN NOT NULL DEFAULT false,
    `polypDescription` TEXT NULL,
    `mucosa` VARCHAR(191) NULL,
    `discharge` VARCHAR(191) NULL,
    `adenoids` VARCHAR(191) NULL,
    `eustachianTubeOrifices` VARCHAR(191) NULL,
    `nasopharynx` VARCHAR(191) NULL,
    `oropharynx` VARCHAR(191) NULL,
    `larynx` TEXT NULL,
    `vocalCords` VARCHAR(191) NULL,
    `lesionsFound` BOOLEAN NOT NULL DEFAULT false,
    `lesionDescription` TEXT NULL,
    `biopsiesTaken` INTEGER NOT NULL DEFAULT 0,
    `biopsySites` VARCHAR(191) NULL,
    `photographsTaken` BOOLEAN NOT NULL DEFAULT false,
    `rigidScopeUsed` BOOLEAN NOT NULL DEFAULT false,
    `flexibleScopeUsed` BOOLEAN NOT NULL DEFAULT true,
    `findings` TEXT NULL,
    `impression` TEXT NULL,
    `recommendations` TEXT NULL,
    `followUpWeeks` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ent_nasal_endoscopy_patientId_idx`(`patientId`),
    INDEX `ent_nasal_endoscopy_providerId_idx`(`providerId`),
    INDEX `ent_nasal_endoscopy_procedureDate_idx`(`procedureDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lab_test_panel_items` ADD CONSTRAINT `lab_test_panel_items_panelId_fkey` FOREIGN KEY (`panelId`) REFERENCES `test_panels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_test_panel_items` ADD CONSTRAINT `lab_test_panel_items_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `lab_tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specimens` ADD CONSTRAINT `specimens_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specimens` ADD CONSTRAINT `specimens_collectedById_fkey` FOREIGN KEY (`collectedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specimens` ADD CONSTRAINT `specimens_receivedById_fkey` FOREIGN KEY (`receivedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_orders` ADD CONSTRAINT `lab_work_orders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_orders` ADD CONSTRAINT `lab_work_orders_specimenId_fkey` FOREIGN KEY (`specimenId`) REFERENCES `specimens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_orders` ADD CONSTRAINT `lab_work_orders_orderedById_fkey` FOREIGN KEY (`orderedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_orders` ADD CONSTRAINT `lab_work_orders_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_orders` ADD CONSTRAINT `lab_work_orders_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_order_items` ADD CONSTRAINT `lab_work_order_items_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `lab_work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_work_order_items` ADD CONSTRAINT `lab_work_order_items_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `lab_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `lab_work_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `lab_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reference_ranges` ADD CONSTRAINT `reference_ranges_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `lab_tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_controls` ADD CONSTRAINT `qc_controls_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `lab_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_results` ADD CONSTRAINT `qc_results_controlId_fkey` FOREIGN KEY (`controlId`) REFERENCES `qc_controls`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_results` ADD CONSTRAINT `qc_results_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qc_results` ADD CONSTRAINT `qc_results_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_eegs` ADD CONSTRAINT `neurology_eegs_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_eegs` ADD CONSTRAINT `neurology_eegs_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_emgs` ADD CONSTRAINT `neurology_emgs_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_emgs` ADD CONSTRAINT `neurology_emgs_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_imaging` ADD CONSTRAINT `neurology_imaging_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_imaging` ADD CONSTRAINT `neurology_imaging_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_strokes` ADD CONSTRAINT `neurology_strokes_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_strokes` ADD CONSTRAINT `neurology_strokes_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_seizures` ADD CONSTRAINT `neurology_seizures_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_seizures` ADD CONSTRAINT `neurology_seizures_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_cognitive_assessments` ADD CONSTRAINT `neurology_cognitive_assessments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neurology_cognitive_assessments` ADD CONSTRAINT `neurology_cognitive_assessments_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_chemotherapy` ADD CONSTRAINT `oncology_chemotherapy_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_chemotherapy` ADD CONSTRAINT `oncology_chemotherapy_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_radiation` ADD CONSTRAINT `oncology_radiation_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_radiation` ADD CONSTRAINT `oncology_radiation_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_staging` ADD CONSTRAINT `oncology_staging_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_staging` ADD CONSTRAINT `oncology_staging_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_tumor_boards` ADD CONSTRAINT `oncology_tumor_boards_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oncology_tumor_boards` ADD CONSTRAINT `oncology_tumor_boards_presenterId_fkey` FOREIGN KEY (`presenterId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_fractures` ADD CONSTRAINT `orthopedic_fractures_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_fractures` ADD CONSTRAINT `orthopedic_fractures_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_joint_replacements` ADD CONSTRAINT `orthopedic_joint_replacements_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_joint_replacements` ADD CONSTRAINT `orthopedic_joint_replacements_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_physical_therapy` ADD CONSTRAINT `orthopedic_physical_therapy_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orthopedic_physical_therapy` ADD CONSTRAINT `orthopedic_physical_therapy_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_spirometry` ADD CONSTRAINT `pulmonology_spirometry_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_spirometry` ADD CONSTRAINT `pulmonology_spirometry_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_sleep_studies` ADD CONSTRAINT `pulmonology_sleep_studies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_sleep_studies` ADD CONSTRAINT `pulmonology_sleep_studies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_bronchoscopies` ADD CONSTRAINT `pulmonology_bronchoscopies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pulmonology_bronchoscopies` ADD CONSTRAINT `pulmonology_bronchoscopies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastro_endoscopies` ADD CONSTRAINT `gastro_endoscopies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastro_endoscopies` ADD CONSTRAINT `gastro_endoscopies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastro_colonoscopies` ADD CONSTRAINT `gastro_colonoscopies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastro_colonoscopies` ADD CONSTRAINT `gastro_colonoscopies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gastro_liver_function` ADD CONSTRAINT `gastro_liver_function_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_diabetes` ADD CONSTRAINT `endo_diabetes_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_diabetes` ADD CONSTRAINT `endo_diabetes_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_insulin` ADD CONSTRAINT `endo_insulin_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_insulin` ADD CONSTRAINT `endo_insulin_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_thyroid` ADD CONSTRAINT `endo_thyroid_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endo_thyroid` ADD CONSTRAINT `endo_thyroid_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obgyn_pregnancies` ADD CONSTRAINT `obgyn_pregnancies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obgyn_pregnancies` ADD CONSTRAINT `obgyn_pregnancies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obgyn_antenatal` ADD CONSTRAINT `obgyn_antenatal_pregnancyId_fkey` FOREIGN KEY (`pregnancyId`) REFERENCES `obgyn_pregnancies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obgyn_deliveries` ADD CONSTRAINT `obgyn_deliveries_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obgyn_deliveries` ADD CONSTRAINT `obgyn_deliveries_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_growth_charts` ADD CONSTRAINT `peds_growth_charts_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_growth_charts` ADD CONSTRAINT `peds_growth_charts_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_vaccinations` ADD CONSTRAINT `peds_vaccinations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_vaccinations` ADD CONSTRAINT `peds_vaccinations_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_developmental` ADD CONSTRAINT `peds_developmental_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peds_developmental` ADD CONSTRAINT `peds_developmental_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_assessments` ADD CONSTRAINT `psychiatry_assessments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_assessments` ADD CONSTRAINT `psychiatry_assessments_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_therapy` ADD CONSTRAINT `psychiatry_therapy_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_therapy` ADD CONSTRAINT `psychiatry_therapy_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_medication` ADD CONSTRAINT `psychiatry_medication_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `psychiatry_medication` ADD CONSTRAINT `psychiatry_medication_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `derm_lesions` ADD CONSTRAINT `derm_lesions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `derm_lesions` ADD CONSTRAINT `derm_lesions_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `derm_biopsies` ADD CONSTRAINT `derm_biopsies_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `derm_biopsies` ADD CONSTRAINT `derm_biopsies_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_exams` ADD CONSTRAINT `ophth_exams_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_exams` ADD CONSTRAINT `ophth_exams_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_visual_acuity` ADD CONSTRAINT `ophth_visual_acuity_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_visual_acuity` ADD CONSTRAINT `ophth_visual_acuity_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_fundus` ADD CONSTRAINT `ophth_fundus_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ophth_fundus` ADD CONSTRAINT `ophth_fundus_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ent_audiometry` ADD CONSTRAINT `ent_audiometry_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ent_audiometry` ADD CONSTRAINT `ent_audiometry_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ent_nasal_endoscopy` ADD CONSTRAINT `ent_nasal_endoscopy_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ent_nasal_endoscopy` ADD CONSTRAINT `ent_nasal_endoscopy_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
