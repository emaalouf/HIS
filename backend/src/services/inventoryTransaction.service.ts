import { PrismaClient, InventoryTransactionType } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createTransactionSchema = z.object({
  transactionType: z.enum(["RECEIPT", "ISSUE", "RETURN", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT", "WASTE", "EXPIRED", "RECALLED", "COUNT"]),
  itemId: z.string().uuid("Invalid item ID"),
  fromLocationId: z.string().uuid("Invalid from location ID").optional(),
  toLocationId: z.string().uuid("Invalid to location ID").optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Unit cost must be non-negative").optional(),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  expirationDate: z.date().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  referenceNumber: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const transferStockSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  fromLocationId: z.string().uuid("Invalid from location ID"),
  toLocationId: z.string().uuid("Invalid to location ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  lotNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const adjustStockSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  locationId: z.string().uuid("Invalid location ID"),
  newQuantity: z.number().int().min(0, "Quantity cannot be negative"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferStockInput = z.infer<typeof transferStockSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;

export class InventoryTransactionService {
  async getAllTransactions(
    filters: {
      transactionType?: string;
      itemId?: string;
      locationId?: string;
      fromDate?: Date;
      toDate?: Date;
      referenceType?: string;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.transactionType) where.transactionType = filters.transactionType;
    if (filters.itemId) where.itemId = filters.itemId;
    if (filters.referenceType) where.referenceType = filters.referenceType;
    if (filters.locationId) {
      where.OR = [
        { fromLocationId: filters.locationId },
        { stock: { locationId: filters.locationId } },
      ];
    }
    if (filters.fromDate || filters.toDate) {
      where.transactionDate = {};
      if (filters.fromDate) where.transactionDate.gte = filters.fromDate;
      if (filters.toDate) where.transactionDate.lte = filters.toDate;
    }
    if (filters.search) {
      where.OR = [
        { transactionNumber: { contains: filters.search, mode: "insensitive" } },
        { referenceNumber: { contains: filters.search, mode: "insensitive" } },
        { lotNumber: { contains: filters.search, mode: "insensitive" } },
        { serialNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              sku: true,
              name: true,
              unitOfMeasure: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          stock: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          performedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { transactionDate: "desc" },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getTransactionById(id: string) {
    return prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: true,
        fromLocation: true,
        stock: {
          include: {
            location: true,
          },
        },
        performedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createTransaction(data: CreateTransactionInput, performedById: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new Error("Item not found");
    }

    // Generate transaction number
    const transactionCount = await prisma.inventoryTransaction.count();
    const transactionNumber = `TRX-${String(transactionCount + 1).padStart(6, "0")}`;

    const unitCost = data.unitCost || item.averageCost;
    const totalCost = unitCost * data.quantity;

    // Start transaction
    return prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          ...data,
          transactionNumber,
          performedById,
          unitCost,
          totalCost,
          transactionDate: new Date(),
        },
      });

      // Update stock based on transaction type
      await this.updateStockForTransaction(tx, transaction, data);

      return transaction;
    });
  }

  private async updateStockForTransaction(tx: any, transaction: any, data: CreateTransactionInput) {
    const { transactionType, itemId, quantity, fromLocationId, toLocationId, lotNumber, serialNumber, expirationDate } = data;

    switch (transactionType) {
      case "RECEIPT":
        // Add stock to location
        await this.addStock(tx, itemId, toLocationId!, quantity, transaction.unitCost, lotNumber, serialNumber, expirationDate);
        break;

      case "ISSUE":
      case "WASTE":
      case "EXPIRED":
      case "RECALLED":
        // Remove stock from location
        await this.removeStock(tx, itemId, fromLocationId!, quantity, lotNumber, serialNumber);
        break;

      case "RETURN":
        // Add stock back (like receipt but to original location)
        await this.addStock(tx, itemId, toLocationId!, quantity, transaction.unitCost, lotNumber, serialNumber, expirationDate);
        break;

      case "ADJUSTMENT":
        // This is handled separately
        break;

      case "TRANSFER_IN":
        await this.addStock(tx, itemId, toLocationId!, quantity, transaction.unitCost, lotNumber, serialNumber, expirationDate);
        break;

      case "TRANSFER_OUT":
        await this.removeStock(tx, itemId, fromLocationId!, quantity, lotNumber, serialNumber);
        break;

      case "COUNT":
        // Stock count - handled separately
        break;
    }

    // Update the transaction with stock reference if applicable
    if (toLocationId) {
      const stock = await tx.inventoryStock.findFirst({
        where: {
          itemId,
          locationId: toLocationId,
          lotNumber: lotNumber || null,
          serialNumber: serialNumber || null,
        },
      });
      if (stock) {
        await tx.inventoryTransaction.update({
          where: { id: transaction.id },
          data: { stockId: stock.id },
        });
      }
    }
  }

  private async addStock(tx: any, itemId: string, locationId: string, quantity: number, unitCost: number, lotNumber?: string, serialNumber?: string, expirationDate?: Date) {
    // Check if stock record exists
    const existingStock = await tx.inventoryStock.findFirst({
      where: {
        itemId,
        locationId,
        lotNumber: lotNumber || null,
        serialNumber: serialNumber || null,
      },
    });

    if (existingStock) {
      // Update existing stock
      await tx.inventoryStock.update({
        where: { id: existingStock.id },
        data: {
          quantityOnHand: { increment: quantity },
          quantityAvailable: { increment: quantity },
          unitCost,
        },
      });
    } else {
      // Create new stock record
      await tx.inventoryStock.create({
        data: {
          itemId,
          locationId,
          quantityOnHand: quantity,
          quantityReserved: 0,
          quantityAvailable: quantity,
          unitCost,
          lotNumber,
          serialNumber,
          expirationDate,
          receivedDate: new Date(),
        },
      });
    }
  }

  private async removeStock(tx: any, itemId: string, locationId: string, quantity: number, lotNumber?: string, serialNumber?: string) {
    // Find stock record
    const stock = await tx.inventoryStock.findFirst({
      where: {
        itemId,
        locationId,
        lotNumber: lotNumber || null,
        serialNumber: serialNumber || null,
      },
    });

    if (!stock) {
      throw new Error("Stock not found for the specified item and location");
    }

    if (stock.quantityOnHand < quantity) {
      throw new Error(`Insufficient stock. Available: ${stock.quantityOnHand}, Requested: ${quantity}`);
    }

    // Update stock
    await tx.inventoryStock.update({
      where: { id: stock.id },
      data: {
        quantityOnHand: { decrement: quantity },
        quantityAvailable: { decrement: quantity },
      },
    });

    // Check if stock should be deleted (zero quantity)
    const updatedStock = await tx.inventoryStock.findUnique({
      where: { id: stock.id },
    });

    if (updatedStock.quantityOnHand === 0 && updatedStock.quantityReserved === 0) {
      await tx.inventoryStock.delete({
        where: { id: stock.id },
      });
    }
  }

  async transferStock(data: TransferStockInput, performedById: string) {
    const { itemId, fromLocationId, toLocationId, quantity, lotNumber, serialNumber, reason, notes } = data;

    if (fromLocationId === toLocationId) {
      throw new Error("From and to locations must be different");
    }

    // Start transaction
    return prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");

      // Create OUT transaction
      const outTransactionNumber = `TRX-${String(await tx.inventoryTransaction.count() + 1).padStart(6, "0")}`;
      const outTransaction = await tx.inventoryTransaction.create({
        data: {
          transactionNumber: outTransactionNumber,
          transactionType: "TRANSFER_OUT",
          itemId,
          fromLocationId,
          quantity,
          unitCost: item.averageCost,
          totalCost: item.averageCost * quantity,
          lotNumber,
          serialNumber,
          reason: `Transfer to location ${toLocationId}`,
          notes,
          performedById,
        },
      });

      // Remove stock from source
      await this.removeStock(tx, itemId, fromLocationId, quantity, lotNumber, serialNumber);

      // Create IN transaction
      const inTransactionNumber = `TRX-${String(await tx.inventoryTransaction.count() + 1).padStart(6, "0")}`;
      const inTransaction = await tx.inventoryTransaction.create({
        data: {
          transactionNumber: inTransactionNumber,
          transactionType: "TRANSFER_IN",
          itemId,
          fromLocationId: undefined,
          toLocationId,
          quantity,
          unitCost: item.averageCost,
          totalCost: item.averageCost * quantity,
          lotNumber,
          serialNumber,
          referenceType: "TRANSFER",
          referenceId: outTransaction.id,
          referenceNumber: outTransactionNumber,
          reason: `Transfer from location ${fromLocationId}`,
          notes,
          performedById,
        },
      });

      // Add stock to destination
      await this.addStock(tx, itemId, toLocationId, quantity, item.averageCost, lotNumber, serialNumber, undefined);

      // Update IN transaction with stock reference
      const newStock = await tx.inventoryStock.findFirst({
        where: {
          itemId,
          locationId: toLocationId,
          lotNumber: lotNumber || null,
          serialNumber: serialNumber || null,
        },
      });
      
      if (newStock) {
        await tx.inventoryTransaction.update({
          where: { id: inTransaction.id },
          data: { stockId: newStock.id },
        });
      }

      return { outTransaction, inTransaction };
    });
  }

  async adjustStock(data: AdjustStockInput, performedById: string) {
    const { itemId, locationId, newQuantity, reason, notes } = data;

    return prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");

      const stock = await tx.inventoryStock.findFirst({
        where: { itemId, locationId },
      });

      const currentQuantity = stock?.quantityOnHand || 0;
      const difference = newQuantity - currentQuantity;

      const transactionNumber = `TRX-${String(await tx.inventoryTransaction.count() + 1).padStart(6, "0")}`;

      // Create adjustment transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          transactionNumber,
          transactionType: "ADJUSTMENT",
          itemId,
          fromLocationId: locationId,
          quantity: Math.abs(difference),
          unitCost: item.averageCost,
          totalCost: item.averageCost * Math.abs(difference),
          reason,
          notes: `${notes || ""} (Adjusted from ${currentQuantity} to ${newQuantity})`,
          performedById,
        },
      });

      if (stock) {
        // Update existing stock
        await tx.inventoryStock.update({
          where: { id: stock.id },
          data: {
            quantityOnHand: newQuantity,
            quantityAvailable: newQuantity - stock.quantityReserved,
          },
        });

        // Update transaction with stock reference
        await tx.inventoryTransaction.update({
          where: { id: transaction.id },
          data: { stockId: stock.id },
        });

        // Delete if zero
        if (newQuantity === 0 && stock.quantityReserved === 0) {
          await tx.inventoryStock.delete({ where: { id: stock.id } });
        }
      } else if (newQuantity > 0) {
        // Create new stock record
        const newStock = await tx.inventoryStock.create({
          data: {
            itemId,
            locationId,
            quantityOnHand: newQuantity,
            quantityReserved: 0,
            quantityAvailable: newQuantity,
            unitCost: item.averageCost,
          },
        });

        await tx.inventoryTransaction.update({
          where: { id: transaction.id },
          data: { stockId: newStock.id },
        });
      }

      return transaction;
    });
  }

  async getTransactionStats(fromDate?: Date, toDate?: Date) {
    const where: any = {};
    if (fromDate || toDate) {
      where.transactionDate = {};
      if (fromDate) where.transactionDate.gte = fromDate;
      if (toDate) where.transactionDate.lte = toDate;
    }

    const [
      totalTransactions,
      transactionsByType,
      totalValue,
    ] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.groupBy({
        by: ["transactionType"],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalCost: true,
        },
      }),
      prisma.inventoryTransaction.aggregate({
        where,
        _sum: {
          totalCost: true,
        },
      }),
    ]);

    return {
      totalTransactions,
      totalValue: totalValue._sum.totalCost || 0,
      transactionsByType: transactionsByType.map((t) => ({
        type: t.transactionType,
        count: t._count.id,
        value: t._sum.totalCost || 0,
      })),
    };
  }
}
