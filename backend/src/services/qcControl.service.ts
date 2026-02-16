import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createQCControlSchema = z.object({
  testId: z.string().uuid("Invalid test ID"),
  lotNumber: z.string().min(1, "Lot number is required"),
  level: z.enum(["NORMAL", "ABNORMAL_LOW", "ABNORMAL_HIGH"]).default("NORMAL"),
  targetValue: z.number(),
  acceptableRange: z.number(),
  manufacturer: z.string().optional(),
  expiryDate: z.date(),
});

export const createQCResultSchema = z.object({
  controlId: z.string().uuid("Invalid control ID"),
  instrumentId: z.string().optional(),
  resultValue: z.number(),
  notes: z.string().optional(),
});

export const reviewQCResultSchema = z.object({
  notes: z.string().optional(),
});

export type CreateQCControlInput = z.infer<typeof createQCControlSchema>;
export type CreateQCResultInput = z.infer<typeof createQCResultSchema>;
export type ReviewQCResultInput = z.infer<typeof reviewQCResultSchema>;

export class QCControlService {
  async getAllControls(
    filters: {
      testId?: string;
      isActive?: boolean;
      expiringBefore?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.testId) where.testId = filters.testId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.expiringBefore) {
      where.expiryDate = {
        lte: filters.expiringBefore,
      };
    }

    const [controls, total] = await Promise.all([
      prisma.qCControl.findMany({
        where,
        include: {
          test: {
            select: {
              id: true,
              code: true,
              name: true,
              unit: true,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.qCControl.count({ where }),
    ]);

    return {
      controls,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getControlById(id: string) {
    const control = await prisma.qCControl.findUnique({
      where: { id },
      include: {
        test: true,
        results: {
          orderBy: {
            runDate: "desc",
          },
          take: 30,
          include: {
            technician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewedBy: {
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

    if (!control) {
      throw new Error("QC control not found");
    }

    return control;
  }

  async createControl(data: CreateQCControlInput) {
    const test = await prisma.labTest.findUnique({
      where: { id: data.testId },
    });

    if (!test) {
      throw new Error("Lab test not found");
    }

    return prisma.qCControl.create({
      data,
      include: {
        test: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async updateControl(id: string, data: Partial<CreateQCControlInput>) {
    const control = await prisma.qCControl.findUnique({ where: { id } });

    if (!control) {
      throw new Error("QC control not found");
    }

    return prisma.qCControl.update({
      where: { id },
      data,
      include: {
        test: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async deactivateControl(id: string) {
    const control = await prisma.qCControl.findUnique({ where: { id } });

    if (!control) {
      throw new Error("QC control not found");
    }

    return prisma.qCControl.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getQCResults(
    filters: {
      controlId?: string;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.controlId) where.controlId = filters.controlId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.runDate = {};
      if (filters.dateFrom) where.runDate.gte = filters.dateFrom;
      if (filters.dateTo) where.runDate.lte = filters.dateTo;
    }

    const [results, total] = await Promise.all([
      prisma.qCResult.findMany({
        where,
        include: {
          control: {
            include: {
              test: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
          technician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { runDate: "desc" },
      }),
      prisma.qCResult.count({ where }),
    ]);

    return {
      results,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async createQCResult(data: CreateQCResultInput, technicianId: string) {
    const control = await prisma.qCControl.findUnique({
      where: { id: data.controlId },
    });

    if (!control) {
      throw new Error("QC control not found");
    }

    const deviation = data.resultValue - control.targetValue;
    const isWithinRange = Math.abs(deviation) <= control.acceptableRange;

    return prisma.qCResult.create({
      data: {
        ...data,
        technicianId,
        deviation,
        status: isWithinRange ? "PASS" : "FAIL",
      },
      include: {
        control: {
          include: {
            test: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
              },
            },
          },
        },
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async reviewQCResult(
    resultId: string,
    data: ReviewQCResultInput,
    reviewedById: string
  ) {
    const result = await prisma.qCResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      throw new Error("QC result not found");
    }

    return prisma.qCResult.update({
      where: { id: resultId },
      data: {
        reviewedById,
        reviewedAt: new Date(),
        notes: data.notes || result.notes,
      },
      include: {
        control: {
          include: {
            test: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getLeveyJenningsData(controlId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const control = await prisma.qCControl.findUnique({
      where: { id: controlId },
    });

    if (!control) {
      throw new Error("QC control not found");
    }

    const results = await prisma.qCResult.findMany({
      where: {
        controlId,
        runDate: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        runDate: "asc",
      },
    });

    const values = results.map((r) => r.resultValue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      values.length;
    const sd = Math.sqrt(variance);

    return {
      control,
      mean,
      sd,
      results: results.map((r) => ({
        date: r.runDate,
        value: r.resultValue,
        deviation: r.deviation,
        status: r.status,
      })),
      limits: {
        target: control.targetValue,
        plus1SD: control.targetValue + control.acceptableRange / 2,
        minus1SD: control.targetValue - control.acceptableRange / 2,
        plus2SD: control.targetValue + control.acceptableRange,
        minus2SD: control.targetValue - control.acceptableRange,
        plus3SD: control.targetValue + control.acceptableRange * 1.5,
        minus3SD: control.targetValue - control.acceptableRange * 1.5,
      },
    };
  }

  async getQCStats() {
    const stats = await prisma.qCResult.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.qCResult.count({
      where: {
        runDate: {
          gte: today,
        },
      },
    });

    const expiringCount = await prisma.qCControl.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        isActive: true,
      },
    });

    const failedCount = await prisma.qCResult.count({
      where: {
        status: "FAIL",
        runDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      },
    });

    return {
      byStatus: stats,
      today: todayCount,
      expiringControls: expiringCount,
      recentFailures: failedCount,
    };
  }
}
