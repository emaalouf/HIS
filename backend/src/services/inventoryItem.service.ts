import { PrismaClient, InventoryItemCategory, InventoryItemStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createInventoryItemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  barcode: z.string().optional(),
  category: z.enum(["MEDICAL_SUPPLIES", "PHARMACEUTICALS", "LABORATORY_SUPPLIES", "SURGICAL_SUPPLIES", "DURABLE_MEDICAL_EQUIPMENT", "OFFICE_SUPPLIES", "LINEN", "NUTRITION", "RADIOLOGY_SUPPLIES", "GENERAL"]),
  subCategory: z.string().optional(),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  unitsPerPackage: z.number().int().min(1).default(1),
  reorderPoint: z.number().int().min(0).default(0),
  reorderQuantity: z.number().int().min(1).default(1),
  maxStockLevel: z.number().int().optional(),
  minStockLevel: z.number().int().min(0).default(0),
  unitCost: z.number().min(0, "Unit cost must be non-negative"),
  isLotTracked: z.boolean().default(false),
  isSerialized: z.boolean().default(false),
  isExpirable: z.boolean().default(false),
  defaultLocation: z.string().optional(),
  storageTempMin: z.number().optional(),
  storageTempMax: z.number().optional(),
  specialHandling: z.string().optional(),
  hcpcsCode: z.string().optional(),
  ndcNumber: z.string().optional(),
  cptCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInventoryItemSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  barcode: z.string().optional(),
  category: z.enum(["MEDICAL_SUPPLIES", "PHARMACEUTICALS", "LABORATORY_SUPPLIES", "SURGICAL_SUPPLIES", "DURABLE_MEDICAL_EQUIPMENT", "OFFICE_SUPPLIES", "LINEN", "NUTRITION", "RADIOLOGY_SUPPLIES", "GENERAL"]).optional(),
  subCategory: z.string().optional(),
  unitOfMeasure: z.string().min(1).optional(),
  unitsPerPackage: z.number().int().min(1).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  reorderQuantity: z.number().int().min(1).optional(),
  maxStockLevel: z.number().int().optional(),
  minStockLevel: z.number().int().min(0).optional(),
  unitCost: z.number().min(0).optional(),
  isLotTracked: z.boolean().optional(),
  isSerialized: z.boolean().optional(),
  isExpirable: z.boolean().optional(),
  defaultLocation: z.string().optional(),
  storageTempMin: z.number().optional(),
  storageTempMax: z.number().optional(),
  specialHandling: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "ON_BACKORDER"]).optional(),
  hcpcsCode: z.string().optional(),
  ndcNumber: z.string().optional(),
  cptCode: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;

export class InventoryItemService {
  async getAllItems(
    filters: {
      category?: string;
      status?: string;
      search?: string;
      lowStock?: boolean;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { sku: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
        { barcode: { contains: filters.search, mode: "insensitive" } },
        { manufacturer: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          stock: {
            select: {
              id: true,
              quantityOnHand: true,
              quantityReserved: true,
              quantityAvailable: true,
              location: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { name: "asc" },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    // Calculate total stock for each item
    const itemsWithStock = items.map((item) => {
      const totalOnHand = item.stock.reduce((sum, s) => sum + s.quantityOnHand, 0);
      const totalReserved = item.stock.reduce((sum, s) => sum + s.quantityReserved, 0);
      const totalAvailable = item.stock.reduce((sum, s) => sum + s.quantityAvailable, 0);
      const isLowStock = totalOnHand <= item.reorderPoint;

      return {
        ...item,
        totalStock: {
          onHand: totalOnHand,
          reserved: totalReserved,
          available: totalAvailable,
        },
        isLowStock,
      };
    });

    // Filter by low stock if requested
    let filteredItems = itemsWithStock;
    if (filters.lowStock) {
      filteredItems = itemsWithStock.filter((item) => item.isLowStock);
    }

    return {
      items: filteredItems,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: filters.lowStock ? filteredItems.length : total,
        totalPages: Math.ceil((filters.lowStock ? filteredItems.length : total) / pagination.limit),
      },
    };
  }

  async getItemById(id: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            location: true,
          },
          orderBy: { quantityOnHand: "desc" },
        },
        transactions: {
          take: 10,
          orderBy: { transactionDate: "desc" },
          include: {
            performedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        poItems: {
          include: {
            purchaseOrder: {
              select: {
                poNumber: true,
                status: true,
                poDate: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) return null;

    const totalOnHand = item.stock.reduce((sum, s) => sum + s.quantityOnHand, 0);
    const totalReserved = item.stock.reduce((sum, s) => sum + s.quantityReserved, 0);
    const totalAvailable = item.stock.reduce((sum, s) => sum + s.quantityAvailable, 0);

    return {
      ...item,
      totalStock: {
        onHand: totalOnHand,
        reserved: totalReserved,
        available: totalAvailable,
      },
      isLowStock: totalOnHand <= item.reorderPoint,
    };
  }

  async getItemBySku(sku: string) {
    return prisma.inventoryItem.findUnique({
      where: { sku },
      include: {
        stock: {
          include: {
            location: true,
          },
        },
      },
    });
  }

  async createItem(data: CreateInventoryItemInput) {
    // Check for duplicate SKU
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { sku: data.sku },
    });

    if (existingItem) {
      throw new Error(`Item with SKU ${data.sku} already exists`);
    }

    // Check for duplicate barcode if provided
    if (data.barcode) {
      const existingBarcode = await prisma.inventoryItem.findUnique({
        where: { barcode: data.barcode },
      });
      if (existingBarcode) {
        throw new Error(`Item with barcode ${data.barcode} already exists`);
      }
    }

    return prisma.inventoryItem.create({
      data: {
        ...data,
        averageCost: data.unitCost,
        lastCost: data.unitCost,
      },
    });
  }

  async updateItem(id: string, data: UpdateInventoryItemInput) {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new Error("Item not found");
    }

    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== item.sku) {
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { sku: data.sku },
      });
      if (existingItem) {
        throw new Error(`Item with SKU ${data.sku} already exists`);
      }
    }

    // Check for duplicate barcode if changing
    if (data.barcode && data.barcode !== item.barcode) {
      const existingBarcode = await prisma.inventoryItem.findUnique({
        where: { barcode: data.barcode },
      });
      if (existingBarcode) {
        throw new Error(`Item with barcode ${data.barcode} already exists`);
      }
    }

    // Update average cost if unit cost changed
    let updateData: any = { ...data };
    if (data.unitCost !== undefined && data.unitCost !== item.unitCost) {
      // Simple moving average calculation
      const newAvg = (item.averageCost + data.unitCost) / 2;
      updateData.averageCost = newAvg;
      updateData.lastCost = data.unitCost;
    }

    return prisma.inventoryItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteItem(id: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        stock: true,
        transactions: true,
      },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    // Check if item has stock
    const hasStock = item.stock.some((s) => s.quantityOnHand > 0);
    if (hasStock) {
      throw new Error("Cannot delete item with existing stock. Please adjust stock to zero first.");
    }

    // Check if item has transactions
    if (item.transactions.length > 0) {
      throw new Error("Cannot delete item with transaction history. Mark as discontinued instead.");
    }

    return prisma.inventoryItem.delete({ where: { id } });
  }

  async getInventoryStats() {
    const [
      totalItems,
      totalValue,
      lowStockItems,
      expiringItems,
    ] = await Promise.all([
      prisma.inventoryItem.count({
        where: { status: InventoryItemStatus.ACTIVE },
      }),
      prisma.inventoryStock.aggregate({
        _sum: {
          quantityOnHand: true,
        },
      }),
      prisma.inventoryItem.count({
        where: {
          status: InventoryItemStatus.ACTIVE,
          stock: {
            some: {
              quantityOnHand: {
                lte: prisma.inventoryItem.fields.reorderPoint,
              },
            },
          },
        },
      }),
      prisma.inventoryStock.count({
        where: {
          expirationDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            gte: new Date(),
          },
        },
      }),
    ]);

    // Get items by category
    const itemsByCategory = await prisma.inventoryItem.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: { status: InventoryItemStatus.ACTIVE },
    });

    return {
      totalItems,
      totalStockQuantity: totalValue._sum.quantityOnHand || 0,
      lowStockItems,
      expiringItems,
      itemsByCategory: itemsByCategory.map((cat) => ({
        category: cat.category,
        count: cat._count.id,
      })),
    };
  }

  async getItemsNeedingReorder() {
    const items = await prisma.inventoryItem.findMany({
      where: {
        status: InventoryItemStatus.ACTIVE,
      },
      include: {
        stock: {
          select: {
            quantityOnHand: true,
          },
        },
      },
    });

    return items
      .map((item) => {
        const totalOnHand = item.stock.reduce((sum, s) => sum + s.quantityOnHand, 0);
        return {
          ...item,
          totalOnHand,
          needsReorder: totalOnHand <= item.reorderPoint,
        };
      })
      .filter((item) => item.needsReorder);
  }
}
