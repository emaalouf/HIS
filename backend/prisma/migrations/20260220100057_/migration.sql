-- CreateTable
CREATE TABLE `inventory_items` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `manufacturer` VARCHAR(191) NULL,
    `modelNumber` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `category` ENUM('MEDICAL_SUPPLIES', 'PHARMACEUTICALS', 'LABORATORY_SUPPLIES', 'SURGICAL_SUPPLIES', 'DURABLE_MEDICAL_EQUIPMENT', 'OFFICE_SUPPLIES', 'LINEN', 'NUTRITION', 'RADIOLOGY_SUPPLIES', 'GENERAL') NOT NULL,
    `subCategory` VARCHAR(191) NULL,
    `unitOfMeasure` VARCHAR(191) NOT NULL,
    `unitsPerPackage` INTEGER NOT NULL DEFAULT 1,
    `reorderPoint` INTEGER NOT NULL DEFAULT 0,
    `reorderQuantity` INTEGER NOT NULL DEFAULT 1,
    `maxStockLevel` INTEGER NULL,
    `minStockLevel` INTEGER NOT NULL DEFAULT 0,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `averageCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `lastCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `isLotTracked` BOOLEAN NOT NULL DEFAULT false,
    `isSerialized` BOOLEAN NOT NULL DEFAULT false,
    `isExpirable` BOOLEAN NOT NULL DEFAULT false,
    `defaultLocation` VARCHAR(191) NULL,
    `storageTempMin` DOUBLE NULL,
    `storageTempMax` DOUBLE NULL,
    `specialHandling` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ON_BACKORDER') NOT NULL DEFAULT 'ACTIVE',
    `hcpcsCode` VARCHAR(191) NULL,
    `ndcNumber` VARCHAR(191) NULL,
    `cptCode` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_items_sku_key`(`sku`),
    UNIQUE INDEX `inventory_items_barcode_key`(`barcode`),
    INDEX `inventory_items_sku_idx`(`sku`),
    INDEX `inventory_items_category_idx`(`category`),
    INDEX `inventory_items_status_idx`(`status`),
    INDEX `inventory_items_barcode_idx`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_locations` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `locationType` VARCHAR(191) NOT NULL,
    `parentLocationId` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NULL,
    `isTemperatureControlled` BOOLEAN NOT NULL DEFAULT false,
    `temperatureMin` DOUBLE NULL,
    `temperatureMax` DOUBLE NULL,
    `isSecure` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_locations_code_key`(`code`),
    INDEX `inventory_locations_code_idx`(`code`),
    INDEX `inventory_locations_locationType_idx`(`locationType`),
    INDEX `inventory_locations_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_stock` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `quantityOnHand` INTEGER NOT NULL DEFAULT 0,
    `quantityReserved` INTEGER NOT NULL DEFAULT 0,
    `quantityAvailable` INTEGER NOT NULL DEFAULT 0,
    `lotNumber` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `expirationDate` DATETIME(3) NULL,
    `receivedDate` DATETIME(3) NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `isQuarantine` BOOLEAN NOT NULL DEFAULT false,
    `quarantineReason` VARCHAR(191) NULL,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `inventory_stock_itemId_idx`(`itemId`),
    INDEX `inventory_stock_locationId_idx`(`locationId`),
    INDEX `inventory_stock_lotNumber_idx`(`lotNumber`),
    INDEX `inventory_stock_serialNumber_idx`(`serialNumber`),
    INDEX `inventory_stock_expirationDate_idx`(`expirationDate`),
    INDEX `inventory_stock_isExpired_idx`(`isExpired`),
    UNIQUE INDEX `inventory_stock_itemId_locationId_lotNumber_serialNumber_key`(`itemId`, `locationId`, `lotNumber`, `serialNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transactionNumber` VARCHAR(191) NOT NULL,
    `transactionType` ENUM('RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'WASTE', 'EXPIRED', 'RECALLED', 'COUNT') NOT NULL,
    `transactionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `itemId` VARCHAR(191) NOT NULL,
    `stockId` VARCHAR(191) NULL,
    `fromLocationId` VARCHAR(191) NULL,
    `toLocationId` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `totalCost` DECIMAL(10, 2) NOT NULL,
    `referenceType` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `referenceNumber` VARCHAR(191) NULL,
    `performedById` VARCHAR(191) NOT NULL,
    `lotNumber` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `expirationDate` DATETIME(3) NULL,
    `reason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_transactions_transactionNumber_key`(`transactionNumber`),
    INDEX `inventory_transactions_transactionNumber_idx`(`transactionNumber`),
    INDEX `inventory_transactions_itemId_idx`(`itemId`),
    INDEX `inventory_transactions_transactionType_idx`(`transactionType`),
    INDEX `inventory_transactions_transactionDate_idx`(`transactionDate`),
    INDEX `inventory_transactions_fromLocationId_idx`(`fromLocationId`),
    INDEX `inventory_transactions_referenceType_idx`(`referenceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contactPerson` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'USA',
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `paymentTerms` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPreferred` BOOLEAN NOT NULL DEFAULT false,
    `rating` TINYINT NULL,
    `performanceScore` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suppliers_code_key`(`code`),
    INDEX `suppliers_code_idx`(`code`),
    INDEX `suppliers_isActive_idx`(`isActive`),
    INDEX `suppliers_isPreferred_idx`(`isPreferred`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_items` (
    `id` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `supplierSku` VARCHAR(191) NULL,
    `supplierName` VARCHAR(191) NULL,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `minOrderQty` INTEGER NOT NULL DEFAULT 1,
    `leadTimeDays` INTEGER NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `supplier_items_supplierId_idx`(`supplierId`),
    INDEX `supplier_items_itemId_idx`(`itemId`),
    UNIQUE INDEX `supplier_items_supplierId_itemId_key`(`supplierId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NOT NULL,
    `poDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supplierId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `shippingAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `expectedDeliveryDate` DATETIME(3) NULL,
    `deliveryLocationId` VARCHAR(191) NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `receivedDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `terms` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_poNumber_key`(`poNumber`),
    INDEX `purchase_orders_poNumber_idx`(`poNumber`),
    INDEX `purchase_orders_supplierId_idx`(`supplierId`),
    INDEX `purchase_orders_status_idx`(`status`),
    INDEX `purchase_orders_poDate_idx`(`poDate`),
    INDEX `purchase_orders_expectedDeliveryDate_idx`(`expectedDeliveryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `quantityOrdered` INTEGER NOT NULL,
    `quantityReceived` INTEGER NOT NULL DEFAULT 0,
    `quantityBackordered` INTEGER NOT NULL DEFAULT 0,
    `unitCost` DECIMAL(10, 2) NOT NULL,
    `totalCost` DECIMAL(10, 2) NOT NULL,
    `isReceived` BOOLEAN NOT NULL DEFAULT false,
    `expectedDeliveryDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `purchase_order_items_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `purchase_order_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisitions` (
    `id` VARCHAR(191) NOT NULL,
    `reqNumber` VARCHAR(191) NOT NULL,
    `reqDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `departmentId` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `neededByDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvalNotes` VARCHAR(191) NULL,
    `fulfilledById` VARCHAR(191) NULL,
    `fulfilledAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `justification` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `requisitions_reqNumber_key`(`reqNumber`),
    INDEX `requisitions_reqNumber_idx`(`reqNumber`),
    INDEX `requisitions_departmentId_idx`(`departmentId`),
    INDEX `requisitions_status_idx`(`status`),
    INDEX `requisitions_priority_idx`(`priority`),
    INDEX `requisitions_reqDate_idx`(`reqDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisition_items` (
    `id` VARCHAR(191) NOT NULL,
    `requisitionId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `quantityRequested` INTEGER NOT NULL,
    `quantityApproved` INTEGER NULL,
    `quantityIssued` INTEGER NOT NULL DEFAULT 0,
    `isFulfilled` BOOLEAN NOT NULL DEFAULT false,
    `substituteItemId` VARCHAR(191) NULL,
    `substitutionApproved` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `requisition_items_requisitionId_idx`(`requisitionId`),
    INDEX `requisition_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_locations` ADD CONSTRAINT `inventory_locations_parentLocationId_fkey` FOREIGN KEY (`parentLocationId`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stock` ADD CONSTRAINT `inventory_stock_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stock` ADD CONSTRAINT `inventory_stock_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `inventory_locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `inventory_stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_fromLocationId_fkey` FOREIGN KEY (`fromLocationId`) REFERENCES `inventory_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_items` ADD CONSTRAINT `supplier_items_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisitions` ADD CONSTRAINT `requisitions_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisitions` ADD CONSTRAINT `requisitions_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisitions` ADD CONSTRAINT `requisitions_fulfilledById_fkey` FOREIGN KEY (`fulfilledById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_items` ADD CONSTRAINT `requisition_items_requisitionId_fkey` FOREIGN KEY (`requisitionId`) REFERENCES `requisitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_items` ADD CONSTRAINT `requisition_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
