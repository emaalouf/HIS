import { PrismaClient, RequisitionStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createRequisitionSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  neededByDate: z.date().optional(),
  justification: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().uuid("Invalid item ID"),
      quantityRequested: z.number().int().min(1, "Quantity must be at least 1"),
      notes: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
});

export const updateRequisitionSchema = z.object({
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  neededByDate: z.date().optional().nullable(),
  justification: z.string().optional(),
  notes: z.string().optional(),
});

export const approveRequisitionSchema = z.object({
  approvedById: z.string().uuid("Invalid approver ID"),
  approvalNotes: z.string().optional(),
  items: z.array(
    z.object({
      requisitionItemId: z.string().uuid("Invalid requisition item ID"),
      quantityApproved: z.number().int().min(0, "Quantity cannot be negative"),
      substituteItemId: z.string().uuid().optional(),
      substitutionApproved: z.boolean().default(false),
    })
  ).optional(),
});

export const fulfillRequisitionSchema = z.object({
  items: z.array(
    z.object({
      requisitionItemId: z.string().uuid("Invalid requisition item ID"),
      quantityIssued: z.number().int().min(0, "Quantity cannot be negative"),
      fromLocationId: z.string().uuid("Invalid from location ID"),
      lotNumber: z.string().optional(),
      serialNumber: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
});

export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>;
export type UpdateRequisitionInput = z.infer<typeof updateRequisitionSchema>;
export type ApproveRequisitionInput = z.infer<typeof approveRequisitionSchema>;
export type FulfillRequisitionInput = z.infer<typeof fulfillRequisitionSchema>;

export class RequisitionService {
  async getAllRequisitions(
    filters: {
      status?: string;
      departmentId?: string;
      priority?: string;
      fromDate?: Date;
      toDate?: Date;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.fromDate || filters.toDate) {
      where.reqDate = {};
      if (filters.fromDate) where.reqDate.gte = filters.fromDate;
      if (filters.toDate) where.reqDate.lte = filters.toDate;
    }
    if (filters.search) {
      where.OR = [
        { reqNumber: { contains: filters.search, mode: "insensitive" } },
        { justification: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [requisitions, total] = await Promise.all([
      prisma.requisition.findMany({
        where,
        include: {
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
          fulfilledBy: {
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
        orderBy: { reqDate: "desc" },
      }),
      prisma.requisition.count({ where }),
    ]);

    return {
      requisitions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getRequisitionById(id: string) {
    const req = await prisma.requisition.findUnique({
      where: { id },
      include: {
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
        fulfilledBy: {
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
              },
            },
            substituteItem: {
              select: {
                id: true,
                sku: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!req) return null;

    // Add available stock info to each item
    const itemsWithStock = req.items.map((item) => {
      const totalAvailable = item.item.stock.reduce((sum, s) => sum + s.quantityAvailable, 0);
      return {
        ...item,
        availableStock: totalAvailable,
        stockLocations: item.item.stock.filter((s) => s.quantityAvailable > 0),
      };
    });

    return {
      ...req,
      items: itemsWithStock,
    };
  }

  async createRequisition(data: CreateRequisitionInput, requestedById: string) {
    // Validate all items exist
    for (const item of data.items) {
      const existingItem = await prisma.inventoryItem.findUnique({
        where: { id: item.itemId },
      });
      if (!existingItem) {
        throw new Error(`Item ${item.itemId} not found`);
      }
    }

    // Generate requisition number
    const reqCount = await prisma.requisition.count();
    const reqNumber = `REQ-${String(reqCount + 1).padStart(6, "0")}`;

    return prisma.requisition.create({
      data: {
        reqNumber,
        departmentId: data.departmentId,
        requestedById,
        priority: data.priority,
        neededByDate: data.neededByDate,
        justification: data.justification,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            itemId: item.itemId,
            quantityRequested: item.quantityRequested,
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
  }

  async updateRequisition(id: string, data: UpdateRequisitionInput) {
    const req = await prisma.requisition.findUnique({ where: { id } });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (req.status !== RequisitionStatus.DRAFT) {
      throw new Error("Can only update draft requisitions");
    }

    return prisma.requisition.update({
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

  async submitRequisition(id: string) {
    const req = await prisma.requisition.findUnique({ where: { id } });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (req.status !== RequisitionStatus.DRAFT) {
      throw new Error("Can only submit draft requisitions");
    }

    return prisma.requisition.update({
      where: { id },
      data: {
        status: RequisitionStatus.PENDING_APPROVAL,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async approveRequisition(id: string, data: ApproveRequisitionInput) {
    const req = await prisma.requisition.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (req.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new Error("Requisition must be pending approval");
    }

    return prisma.$transaction(async (tx) => {
      // Update approved quantities if provided
      if (data.items) {
        for (const item of data.items) {
          await tx.requisitionItem.update({
            where: { id: item.requisitionItemId },
            data: {
              quantityApproved: item.quantityApproved,
              substituteItemId: item.substituteItemId,
              substitutionApproved: item.substitutionApproved,
            },
          });
        }
      }

      // Update requisition status
      return tx.requisition.update({
        where: { id },
        data: {
          status: RequisitionStatus.APPROVED,
          approvedById: data.approvedById,
          approvedAt: new Date(),
          approvalNotes: data.approvalNotes,
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

  async rejectRequisition(id: string, approvedById: string, reason: string) {
    const req = await prisma.requisition.findUnique({ where: { id } });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (req.status !== RequisitionStatus.PENDING_APPROVAL) {
      throw new Error("Requisition must be pending approval");
    }

    return prisma.requisition.update({
      where: { id },
      data: {
        status: RequisitionStatus.REJECTED,
        approvedById,
        approvedAt: new Date(),
        approvalNotes: reason,
      },
    });
  }

  async fulfillRequisition(id: string, data: FulfillRequisitionInput, fulfilledById: string) {
    const req = await prisma.requisition.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (req.status !== RequisitionStatus.APPROVED) {
      throw new Error("Requisition must be approved before fulfillment");
    }

    return prisma.$transaction(async (tx) => {
      for (const fulfillment of data.items) {
        const reqItem = req.items.find((item) => item.id === fulfillment.requisitionItemId);
        if (!reqItem) {
          throw new Error(`Requisition item ${fulfillment.requisitionItemId} not found`);
        }

        if (fulfillment.quantityIssued <= 0) continue;

        const item = await tx.inventoryItem.findUnique({
          where: { id: reqItem.itemId },
        });

        // Update requisition item
        const newIssuedQty = reqItem.quantityIssued + fulfillment.quantityIssued;
        const isFulfilled = newIssuedQty >= (reqItem.quantityApproved || reqItem.quantityRequested);

        await tx.requisitionItem.update({
          where: { id: fulfillment.requisitionItemId },
          data: {
            quantityIssued: newIssuedQty,
            isFulfilled,
          },
        });

        // Create inventory transaction (ISSUE)
        const transactionCount = await tx.inventoryTransaction.count();
        await tx.inventoryTransaction.create({
          data: {
            transactionNumber: `TRX-${String(transactionCount + 1).padStart(6, "0")}`,
            transactionType: "ISSUE",
            itemId: reqItem.itemId,
            fromLocationId: fulfillment.fromLocationId,
            quantity: fulfillment.quantityIssued,
            unitCost: item.averageCost,
            totalCost: item.averageCost * fulfillment.quantityIssued,
            lotNumber: fulfillment.lotNumber,
            serialNumber: fulfillment.serialNumber,
            referenceType: "REQUISITION",
            referenceId: req.id,
            referenceNumber: req.reqNumber,
            notes: data.notes,
            performedById: fulfilledById,
          },
        });

        // Remove stock from location
        await this.removeStockFromLocation(tx, {
          itemId: reqItem.itemId,
          locationId: fulfillment.fromLocationId,
          quantity: fulfillment.quantityIssued,
          lotNumber: fulfillment.lotNumber,
          serialNumber: fulfillment.serialNumber,
        });
      }

      // Check if all items are fulfilled
      const updatedItems = await tx.requisitionItem.findMany({
        where: { requisitionId: id },
      });

      const allFulfilled = updatedItems.every((item) => item.isFulfilled);
      const anyFulfilled = updatedItems.some((item) => item.quantityIssued > 0);

      let newStatus = req.status;
      if (allFulfilled) {
        newStatus = RequisitionStatus.FULFILLED;
      } else if (anyFulfilled) {
        newStatus = RequisitionStatus.PARTIALLY_FULFILLED;
      }

      // Update requisition
      return tx.requisition.update({
        where: { id },
        data: {
          status: newStatus,
          fulfilledById,
          fulfilledAt: anyFulfilled ? new Date() : undefined,
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

  private async removeStockFromLocation(
    tx: any,
    data: {
      itemId: string;
      locationId: string;
      quantity: number;
      lotNumber?: string;
      serialNumber?: string;
    }
  ) {
    const { itemId, locationId, quantity, lotNumber, serialNumber } = data;

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

    await tx.inventoryStock.update({
      where: { id: stock.id },
      data: {
        quantityOnHand: { decrement: quantity },
        quantityAvailable: { decrement: quantity },
      },
    });

    // Delete if zero
    const updatedStock = await tx.inventoryStock.findUnique({
      where: { id: stock.id },
    });

    if (updatedStock.quantityOnHand === 0 && updatedStock.quantityReserved === 0) {
      await tx.inventoryStock.delete({ where: { id: stock.id } });
    }
  }

  async cancelRequisition(id: string, reason?: string) {
    const req = await prisma.requisition.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!req) {
      throw new Error("Requisition not found");
    }

    if (["FULFILLED", "PARTIALLY_FULFILLED"].includes(req.status)) {
      throw new Error("Cannot cancel fulfilled or partially fulfilled requisitions");
    }

    // Check if any items have been issued
    const hasIssued = req.items.some((item) => item.quantityIssued > 0);
    if (hasIssued) {
      throw new Error("Cannot cancel requisition with issued items");
    }

    return prisma.requisition.update({
      where: { id },
      data: {
        status: RequisitionStatus.CANCELLED,
        notes: reason ? `${req.notes || ""}\n\nCancellation reason: ${reason}` : req.notes,
      },
    });
  }

  async getRequisitionStats() {
    const [
      totalRequisitions,
      byStatus,
      byPriority,
      pendingApproval,
      pendingFulfillment,
    ] = await Promise.all([
      prisma.requisition.count(),
      prisma.requisition.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),
      prisma.requisition.groupBy({
        by: ["priority"],
        _count: {
          id: true,
        },
      }),
      prisma.requisition.count({
        where: { status: "PENDING_APPROVAL" },
      }),
      prisma.requisition.count({
        where: {
          status: {
            in: ["APPROVED", "PARTIALLY_FULFILLED"],
          },
        },
      }),
    ]);

    return {
      totalRequisitions,
      pendingApproval,
      pendingFulfillment,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byPriority: byPriority.map((p) => ({
        priority: p.priority,
        count: p._count.id,
      })),
    };
  }
}
