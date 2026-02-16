import { PrismaClient, PurchaseOrderStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier ID"),
  expectedDeliveryDate: z.date().optional(),
  deliveryLocationId: z.string().uuid().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().uuid("Invalid item ID"),
      quantityOrdered: z.number().int().min(1, "Quantity must be at least 1"),
      unitCost: z.number().min(0, "Unit cost must be non-negative"),
      expectedDeliveryDate: z.date().optional(),
      notes: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().uuid().optional(),
  expectedDeliveryDate: z.date().optional(),
  deliveryLocationId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const approvePurchaseOrderSchema = z.object({
  approvedById: z.string().uuid("Invalid approver ID"),
});

export const receivePurchaseOrderSchema = z.object({
  items: z.array(
    z.object({
      poItemId: z.string().uuid("Invalid PO item ID"),
      quantityReceived: z.number().int().min(0, "Quantity cannot be negative"),
      lotNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      expirationDate: z.date().optional(),
      unitCost: z.number().min(0).optional(),
    })
  ),
  locationId: z.string().uuid("Invalid location ID"),
  notes: z.string().optional(),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type ApprovePurchaseOrderInput = z.infer<typeof approvePurchaseOrderSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>;

export class PurchaseOrderService {
  async getAllPurchaseOrders(
    filters: {
      status?: string;
      supplierId?: string;
      fromDate?: Date;
      toDate?: Date;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.fromDate || filters.toDate) {
      where.poDate = {};
      if (filters.fromDate) where.poDate.gte = filters.fromDate;
      if (filters.toDate) where.poDate.lte = filters.toDate;
    }
    if (filters.search) {
      where.OR = [
        { poNumber: { contains: filters.search, mode: "insensitive" } },
        { supplier: { name: { contains: filters.search, mode: "insensitive" } } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          requestedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  unitOfMeasure: true,
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { poDate: "desc" },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    // Calculate totals for each PO
    const ordersWithTotals = purchaseOrders.map((po) => ({
      ...po,
      totalItems: po.items.length,
      totalReceived: po.items.reduce((sum, item) => sum + item.quantityReceived, 0),
      totalOrdered: po.items.reduce((sum, item) => sum + item.quantityOrdered, 0),
    }));

    return {
      purchaseOrders: ordersWithTotals,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getPurchaseOrderById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        requestedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            item: {
              include: {
                stock: {
                  select: {
                    quantityOnHand: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!po) return null;

    return {
      ...po,
      items: po.items.map((item) => ({
        ...item,
        currentStock: item.item.stock.reduce((sum, s) => sum + s.quantityOnHand, 0),
      })),
    };
  }

  async createPurchaseOrder(data: CreatePurchaseOrderInput, requestedById: string) {
    const { supplierId, items, ...orderData } = data;

    // Validate supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    if (!supplier.isActive) {
      throw new Error("Supplier is not active");
    }

    // Generate PO number
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${String(poCount + 1).padStart(6, "0")}`;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);
    const totalAmount = subtotal; // Add tax, shipping, discount logic as needed

    return prisma.$transaction(async (tx) => {
      // Create purchase order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          requestedById,
          subtotal,
          totalAmount,
          ...orderData,
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantityOrdered: item.quantityOrdered,
              unitCost: item.unitCost,
              totalCost: item.quantityOrdered * item.unitCost,
              expectedDeliveryDate: item.expectedDeliveryDate,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      return purchaseOrder;
    });
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderInput) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (!["DRAFT", "PENDING_APPROVAL"].includes(po.status)) {
      throw new Error("Cannot update purchase order that is already approved or sent");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async approvePurchaseOrder(id: string, data: ApprovePurchaseOrderInput) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (po.status !== "PENDING_APPROVAL") {
      throw new Error("Purchase order must be pending approval");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.APPROVED,
        approvedById: data.approvedById,
        approvedAt: new Date(),
      },
    });
  }

  async sendToSupplier(id: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (po.status !== "APPROVED") {
      throw new Error("Purchase order must be approved before sending to supplier");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.SENT_TO_SUPPLIER,
      },
    });
  }

  async receivePurchaseOrder(id: string, data: ReceivePurchaseOrderInput, receivedById: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (!["SENT_TO_SUPPLIER", "PARTIALLY_RECEIVED"].includes(po.status)) {
      throw new Error("Purchase order must be sent to supplier to receive items");
    }

    return prisma.$transaction(async (tx) => {
      // Process each received item
      for (const receipt of data.items) {
        const poItem = po.items.find((item) => item.id === receipt.poItemId);
        if (!poItem) {
          throw new Error(`PO item ${receipt.poItemId} not found`);
        }

        const newReceivedQty = poItem.quantityReceived + receipt.quantityReceived;
        const isFullyReceived = newReceivedQty >= poItem.quantityOrdered;

        // Update PO item
        await tx.purchaseOrderItem.update({
          where: { id: receipt.poItemId },
          data: {
            quantityReceived: newReceivedQty,
            quantityBackordered: Math.max(0, poItem.quantityOrdered - newReceivedQty),
            isReceived: isFullyReceived,
          },
        });

        // Create inventory transaction (RECEIPT)
        if (receipt.quantityReceived > 0) {
          const item = await tx.inventoryItem.findUnique({
            where: { id: poItem.itemId },
          });

          const transactionCount = await tx.inventoryTransaction.count();
          await tx.inventoryTransaction.create({
            data: {
              transactionNumber: `TRX-${String(transactionCount + 1).padStart(6, "0")}`,
              transactionType: "RECEIPT",
              itemId: poItem.itemId,
              quantity: receipt.quantityReceived,
              unitCost: receipt.unitCost || poItem.unitCost,
              totalCost: (receipt.unitCost || poItem.unitCost) * receipt.quantityReceived,
              lotNumber: receipt.lotNumber,
              serialNumber: receipt.serialNumber,
              expirationDate: receipt.expirationDate,
              referenceType: "PO",
              referenceId: po.id,
              referenceNumber: po.poNumber,
              notes: data.notes,
              performedById: receivedById,
            },
          });

          // Add to stock
          await this.addStockToLocation(tx, {
            itemId: poItem.itemId,
            locationId: data.locationId,
            quantity: receipt.quantityReceived,
            unitCost: receipt.unitCost || poItem.unitCost,
            lotNumber: receipt.lotNumber,
            serialNumber: receipt.serialNumber,
            expirationDate: receipt.expirationDate,
          });

          // Update item average cost
          const newAvgCost = (item.averageCost + (receipt.unitCost || poItem.unitCost)) / 2;
          await tx.inventoryItem.update({
            where: { id: poItem.itemId },
            data: {
              averageCost: newAvgCost,
              lastCost: receipt.unitCost || poItem.unitCost,
            },
          });
        }
      }

      // Check if all items are received
      const updatedItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: id },
      });

      const allReceived = updatedItems.every((item) => item.isReceived);
      const anyReceived = updatedItems.some((item) => item.quantityReceived > 0);

      let newStatus = po.status;
      if (allReceived) {
        newStatus = PurchaseOrderStatus.RECEIVED;
      } else if (anyReceived) {
        newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      }

      // Update PO status
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: newStatus,
          receivedDate: anyReceived ? new Date() : po.receivedDate,
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    });
  }

  private async addStockToLocation(
    tx: any,
    data: {
      itemId: string;
      locationId: string;
      quantity: number;
      unitCost: number;
      lotNumber?: string;
      serialNumber?: string;
      expirationDate?: Date;
    }
  ) {
    const { itemId, locationId, quantity, unitCost, lotNumber, serialNumber, expirationDate } = data;

    const existingStock = await tx.inventoryStock.findFirst({
      where: {
        itemId,
        locationId,
        lotNumber: lotNumber || null,
        serialNumber: serialNumber || null,
      },
    });

    if (existingStock) {
      await tx.inventoryStock.update({
        where: { id: existingStock.id },
        data: {
          quantityOnHand: { increment: quantity },
          quantityAvailable: { increment: quantity },
          unitCost,
        },
      });
    } else {
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

  async cancelPurchaseOrder(id: string, reason?: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (["RECEIVED", "CLOSED"].includes(po.status)) {
      throw new Error("Cannot cancel received or closed purchase order");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CANCELLED,
        notes: reason ? `${po.notes || ""}\n\nCancellation reason: ${reason}` : po.notes,
      },
    });
  }

  async closePurchaseOrder(id: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (!["RECEIVED", "CANCELLED"].includes(po.status)) {
      throw new Error("Purchase order must be received or cancelled to close");
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: PurchaseOrderStatus.CLOSED,
      },
    });
  }

  async getPurchaseOrderStats() {
    const [
      totalPOs,
      byStatus,
      totalValue,
      pendingApproval,
      pendingReceipt,
    ] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.purchaseOrder.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.purchaseOrder.count({
        where: { status: "PENDING_APPROVAL" },
      }),
      prisma.purchaseOrder.count({
        where: {
          status: {
            in: ["APPROVED", "SENT_TO_SUPPLIER", "PARTIALLY_RECEIVED"],
          },
        },
      }),
    ]);

    return {
      totalPOs,
      totalValue: totalValue._sum.totalAmount || 0,
      pendingApproval,
      pendingReceipt,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
        value: s._sum.totalAmount || 0,
      })),
    };
  }
}
