import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createLabWorkOrderSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  specimenId: z.string().uuid("Invalid specimen ID").optional(),
  clinicalOrderId: z.string().uuid("Invalid clinical order ID").optional(),
  testPanelId: z.string().uuid("Invalid test panel ID").optional(),
  testIds: z.array(z.string().uuid()).optional(),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).default("ROUTINE"),
  notes: z.string().optional(),
});

export const updateLabWorkOrderSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"]).optional(),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const verifyLabWorkOrderSchema = z.object({
  notes: z.string().optional(),
});

export type CreateLabWorkOrderInput = z.infer<typeof createLabWorkOrderSchema>;
export type UpdateLabWorkOrderInput = z.infer<typeof updateLabWorkOrderSchema>;
export type VerifyLabWorkOrderInput = z.infer<typeof verifyLabWorkOrderSchema>;

export class LabWorkOrderService {
  async getAllWorkOrders(
    filters: {
      patientId?: string;
      status?: string;
      priority?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.dateFrom || filters.dateTo) {
      where.orderedAt = {};
      if (filters.dateFrom) where.orderedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.orderedAt.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        {
          patient: {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" } },
              { lastName: { contains: filters.search, mode: "insensitive" } },
              { mrn: { contains: filters.search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [workOrders, total] = await Promise.all([
      prisma.labWorkOrder.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          specimen: {
            select: {
              id: true,
              barcode: true,
              specimenType: true,
              status: true,
            },
          },
          orderedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              test: true,
            },
          },
          _count: {
            select: {
              results: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { orderedAt: "desc" },
      }),
      prisma.labWorkOrder.count({ where }),
    ]);

    return {
      workOrders,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getWorkOrderById(id: string) {
    const workOrder = await prisma.labWorkOrder.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        specimen: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        orderedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            test: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        results: {
          include: {
            test: true,
            technician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    return workOrder;
  }

  async getWorkOrderByNumber(orderNumber: string) {
    const workOrder = await prisma.labWorkOrder.findUnique({
      where: { orderNumber },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        specimen: true,
        items: {
          include: {
            test: true,
          },
        },
        results: {
          include: {
            test: true,
          },
        },
      },
    });

    return workOrder;
  }

  async createWorkOrder(data: CreateLabWorkOrderInput, orderedById: string) {
    const orderNumber = await this.generateOrderNumber();

    const { testIds, testPanelId, ...orderData } = data;

    let items: { testId: string; order: number }[] = [];

    if (testPanelId) {
      const panel = await prisma.testPanel.findUnique({
        where: { id: testPanelId },
        include: {
          items: {
            include: {
              test: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!panel) {
        throw new Error("Test panel not found");
      }

      items = panel.items.map((item, index) => ({
        testId: item.testId,
        order: index,
      }));
    } else if (testIds && testIds.length > 0) {
      items = testIds.map((testId, index) => ({
        testId,
        order: index,
      }));
    } else {
      throw new Error("Either test panel ID or test IDs must be provided");
    }

    return prisma.labWorkOrder.create({
      data: {
        ...orderData,
        orderNumber,
        orderedById,
        items: {
          create: items,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async updateWorkOrder(id: string, data: UpdateLabWorkOrderInput) {
    const workOrder = await prisma.labWorkOrder.findUnique({ where: { id } });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.status === "COMPLETED") {
      throw new Error("Cannot update a completed work order");
    }

    const updateData: any = { ...data };

    if (data.status === "IN_PROGRESS" && workOrder.status === "PENDING") {
      updateData.startTime = new Date();
    }

    if (data.status === "COMPLETED") {
      updateData.completedTime = new Date();
    }

    return prisma.labWorkOrder.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async verifyWorkOrder(id: string, data: VerifyLabWorkOrderInput, verifiedById: string) {
    const workOrder = await prisma.labWorkOrder.findUnique({ where: { id } });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.status !== "COMPLETED") {
      throw new Error("Work order must be completed before verification");
    }

    const pendingResults = await prisma.labResult.count({
      where: {
        workOrderId: id,
        status: "PENDING",
      },
    });

    if (pendingResults > 0) {
      throw new Error("All results must be finalized before verification");
    }

    return prisma.labWorkOrder.update({
      where: { id },
      data: {
        verifiedById,
        verifiedAt: new Date(),
        notes: data.notes || workOrder.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async cancelWorkOrder(id: string, reason: string, cancelledById: string) {
    const workOrder = await prisma.labWorkOrder.findUnique({ where: { id } });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    if (workOrder.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed work order");
    }

    return prisma.labWorkOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledById,
        cancelledAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const prefix = `WO${year}${month}${day}`;
    
    const lastOrder = await prisma.labWorkOrder.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, "0")}`;
  }

  async getWorkOrderStats() {
    const stats = await prisma.labWorkOrder.groupBy({
      by: ["status", "priority"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.labWorkOrder.count({
      where: {
        orderedAt: {
          gte: today,
        },
      },
    });

    const pendingSTAT = await prisma.labWorkOrder.count({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
        priority: "STAT",
      },
    });

    return {
      byStatusAndPriority: stats,
      today: todayCount,
      pendingSTAT,
    };
  }
}
