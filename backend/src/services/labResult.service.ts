import { PrismaClient, LabResultFlag } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createLabResultSchema = z.object({
  workOrderId: z.string().uuid("Invalid work order ID"),
  testId: z.string().uuid("Invalid test ID"),
  value: z.string().min(1, "Result value is required"),
  numericValue: z.number().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  interpretation: z.string().optional(),
  instrumentId: z.string().optional(),
  method: z.string().optional(),
  dilution: z.number().optional(),
  comments: z.string().optional(),
});

export const updateLabResultSchema = z.object({
  value: z.string().optional(),
  numericValue: z.number().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  interpretation: z.string().optional(),
  comments: z.string().optional(),
});

export const reviewLabResultSchema = z.object({
  notes: z.string().optional(),
});

export type CreateLabResultInput = z.infer<typeof createLabResultSchema>;
export type UpdateLabResultInput = z.infer<typeof updateLabResultSchema>;
export type ReviewLabResultInput = z.infer<typeof reviewLabResultSchema>;

export class LabResultService {
  async getAllResults(
    filters: {
      patientId?: string;
      workOrderId?: string;
      testId?: string;
      status?: string;
      flag?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.workOrderId) where.workOrderId = filters.workOrderId;
    if (filters.testId) where.testId = filters.testId;
    if (filters.status) where.status = filters.status;
    if (filters.flag) where.flag = filters.flag;
    if (filters.dateFrom || filters.dateTo) {
      where.resultedAt = {};
      if (filters.dateFrom) where.resultedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.resultedAt.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
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

    const [results, total] = await Promise.all([
      prisma.labResult.findMany({
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
          test: true,
          workOrder: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
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
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { resultedAt: "desc" },
      }),
      prisma.labResult.count({ where }),
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

  async getResultById(id: string) {
    const result = await prisma.labResult.findUnique({
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
        test: {
          include: {
            referenceRanges: true,
          },
        },
        workOrder: {
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
    });

    if (!result) {
      throw new Error("Lab result not found");
    }

    return result;
  }

  async getPatientResults(
    patientId: string,
    filters: {
      testId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {
      patientId,
      status: {
        in: ["FINAL", "AMENDED"],
      },
    };

    if (filters.testId) where.testId = filters.testId;
    if (filters.dateFrom || filters.dateTo) {
      where.resultedAt = {};
      if (filters.dateFrom) where.resultedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.resultedAt.lte = filters.dateTo;
    }

    const [results, total] = await Promise.all([
      prisma.labResult.findMany({
        where,
        include: {
          test: true,
          technician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { resultedAt: "desc" },
      }),
      prisma.labResult.count({ where }),
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

  async createResult(data: CreateLabResultInput, technicianId: string) {
    const workOrder = await prisma.labWorkOrder.findUnique({
      where: { id: data.workOrderId },
      include: {
        patient: true,
      },
    });

    if (!workOrder) {
      throw new Error("Work order not found");
    }

    const test = await prisma.labTest.findUnique({
      where: { id: data.testId },
      include: {
        referenceRanges: true,
      },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    const flag = this.calculateFlag(
      data.numericValue,
      test.referenceRanges,
      workOrder.patient.gender,
      workOrder.patient.dateOfBirth
    );

    return prisma.labResult.create({
      data: {
        ...data,
        patientId: workOrder.patientId,
        technicianId,
        resultedAt: new Date(),
        status: "PRELIMINARY",
        flag,
      },
      include: {
        test: true,
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
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

  async updateResult(id: string, data: UpdateLabResultInput) {
    const result = await prisma.labResult.findUnique({
      where: { id },
      include: {
        test: {
          include: {
            referenceRanges: true,
          },
        },
        patient: true,
      },
    });

    if (!result) {
      throw new Error("Lab result not found");
    }

    if (result.status === "FINAL") {
      throw new Error("Cannot update a final result. Create an amended result instead.");
    }

    let flag = result.flag;
    if (data.numericValue !== undefined) {
      flag = this.calculateFlag(
        data.numericValue,
        result.test.referenceRanges,
        result.patient.gender,
        result.patient.dateOfBirth
      );
    }

    return prisma.labResult.update({
      where: { id },
      data: {
        ...data,
        flag,
        status: "PRELIMINARY",
      },
      include: {
        test: true,
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

  async finalizeResult(id: string) {
    const result = await prisma.labResult.findUnique({
      where: { id },
      include: {
        workOrder: true,
      },
    });

    if (!result) {
      throw new Error("Lab result not found");
    }

    if (result.status !== "PRELIMINARY") {
      throw new Error("Only preliminary results can be finalized");
    }

    return prisma.labResult.update({
      where: { id },
      data: {
        status: "FINAL",
      },
      include: {
        test: true,
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

  async reviewResult(id: string, data: ReviewLabResultInput, reviewerId: string) {
    const result = await prisma.labResult.findUnique({
      where: { id },
      include: {
        workOrder: true,
      },
    });

    if (!result) {
      throw new Error("Lab result not found");
    }

    if (result.status !== "FINAL") {
      throw new Error("Only final results can be reviewed");
    }

    return prisma.labResult.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewerId,
        comments: data.notes || result.comments,
      },
      include: {
        test: true,
        patient: {
          select: {
            id: true,
            mrn: true,
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
    });
  }

  async amendResult(
    originalResultId: string,
    data: CreateLabResultInput,
    technicianId: string
  ) {
    const originalResult = await prisma.labResult.findUnique({
      where: { id: originalResultId },
      include: {
        test: {
          include: {
            referenceRanges: true,
          },
        },
        patient: true,
      },
    });

    if (!originalResult) {
      throw new Error("Original result not found");
    }

    if (originalResult.status !== "FINAL") {
      throw new Error("Only final results can be amended");
    }

    await prisma.labResult.update({
      where: { id: originalResultId },
      data: {
        status: "AMENDED",
      },
    });

    const flag = this.calculateFlag(
      data.numericValue,
      originalResult.test.referenceRanges,
      originalResult.patient.gender,
      originalResult.patient.dateOfBirth
    );

    return prisma.labResult.create({
      data: {
        ...data,
        patientId: originalResult.patientId,
        technicianId,
        resultedAt: new Date(),
        status: "FINAL",
        flag,
      },
      include: {
        test: true,
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

  private calculateFlag(
    value: number | undefined,
    referenceRanges: any[],
    gender: string,
    dateOfBirth: Date
  ): LabResultFlag {
    if (value === undefined || value === null) {
      return LabResultFlag.NORMAL;
    }

    const ageInMonths = this.calculateAgeInMonths(dateOfBirth);

    const applicableRange = referenceRanges.find((range) => {
      const genderMatch = !range.gender || range.gender === gender;
      const ageMatch =
        (!range.ageMin || ageInMonths >= range.ageMin) &&
        (!range.ageMax || ageInMonths <= range.ageMax);
      return genderMatch && ageMatch;
    }) || referenceRanges.find((range) => range.isDefault);

    if (!applicableRange) {
      return LabResultFlag.NORMAL;
    }

    if (
      applicableRange.criticalLow !== null &&
      applicableRange.criticalLow !== undefined &&
      value < applicableRange.criticalLow
    ) {
      return LabResultFlag.CRITICAL_LOW;
    }

    if (
      applicableRange.criticalHigh !== null &&
      applicableRange.criticalHigh !== undefined &&
      value > applicableRange.criticalHigh
    ) {
      return LabResultFlag.CRITICAL_HIGH;
    }

    if (
      applicableRange.lowValue !== null &&
      applicableRange.lowValue !== undefined &&
      value < applicableRange.lowValue
    ) {
      return LabResultFlag.LOW;
    }

    if (
      applicableRange.highValue !== null &&
      applicableRange.highValue !== undefined &&
      value > applicableRange.highValue
    ) {
      return LabResultFlag.HIGH;
    }

    return LabResultFlag.NORMAL;
  }

  private calculateAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const birth = new Date(dateOfBirth);
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return years * 12 + months;
  }

  async getCriticalResults() {
    return prisma.labResult.findMany({
      where: {
        flag: {
          in: ["CRITICAL_LOW", "CRITICAL_HIGH"],
        },
        status: {
          in: ["FINAL", "AMENDED"],
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
        test: true,
      },
      orderBy: {
        resultedAt: "desc",
      },
      take: 50,
    });
  }

  async getResultStats() {
    const stats = await prisma.labResult.groupBy({
      by: ["status", "flag"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.labResult.count({
      where: {
        resultedAt: {
          gte: today,
        },
      },
    });

    const criticalCount = await prisma.labResult.count({
      where: {
        flag: {
          in: ["CRITICAL_LOW", "CRITICAL_HIGH"],
        },
        status: {
          in: ["FINAL", "AMENDED"],
        },
      },
    });

    return {
      byStatusAndFlag: stats,
      today: todayCount,
      critical: criticalCount,
    };
  }
}
