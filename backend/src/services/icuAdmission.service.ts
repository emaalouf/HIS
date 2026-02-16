import { PrismaClient, IcuAdmissionStatus, IcuAdmissionSource } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createIcuAdmissionSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  admissionSource: z.enum(["ED", "OR", "WARD", "ANOTHER_HOSPITAL", "DIRECT_ADMISSION"]),
  admittingProviderId: z.string().uuid("Invalid provider ID"),
  bedId: z.string().optional(),
  bedNumber: z.string().optional(),
  primaryDiagnosis: z.string().min(1, "Primary diagnosis is required"),
  secondaryDiagnoses: z.string().optional(),
  admissionReason: z.string().optional(),
  expectedLos: z.number().optional(),
  admissionNotes: z.string().optional(),
  isIsolated: z.boolean().default(false),
  isolationType: z.string().optional(),
});

export const updateIcuAdmissionSchema = z.object({
  bedId: z.string().optional(),
  bedNumber: z.string().optional(),
  currentStatus: z.enum(["ADMITTED", "CRITICAL", "STABLE", "IMPROVING", "DETERIORATING", "DISCHARGED", "DECEASED"]).optional(),
  apacheIIScore: z.number().optional(),
  isVentilated: z.boolean().optional(),
  isSedated: z.boolean().optional(),
  isIsolated: z.boolean().optional(),
  isolationType: z.string().optional(),
  secondaryDiagnoses: z.string().optional(),
  dischargeDate: z.date().optional(),
  dischargeDisposition: z.string().optional(),
  dischargeProviderId: z.string().uuid().optional(),
  dischargeNotes: z.string().optional(),
  icuLos: z.number().optional(),
  hospitalLos: z.number().optional(),
  diedInIcu: z.boolean().optional(),
});

export type CreateIcuAdmissionInput = z.infer<typeof createIcuAdmissionSchema>;
export type UpdateIcuAdmissionInput = z.infer<typeof updateIcuAdmissionSchema>;

export class IcuAdmissionService {
  async getAllAdmissions(
    filters: {
      patientId?: string;
      status?: string;
      admissionSource?: string;
      admittingProviderId?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.currentStatus = filters.status;
    if (filters.admissionSource) where.admissionSource = filters.admissionSource;
    if (filters.admittingProviderId) where.admittingProviderId = filters.admittingProviderId;
    if (filters.dateFrom || filters.dateTo) {
      where.admissionDate = {};
      if (filters.dateFrom) where.admissionDate.gte = filters.dateFrom;
      if (filters.dateTo) where.admissionDate.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { admissionNumber: { contains: filters.search, mode: "insensitive" } },
        { primaryDiagnosis: { contains: filters.search, mode: "insensitive" } },
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

    const [admissions, total] = await Promise.all([
      prisma.icuAdmission.findMany({
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
          admittingProvider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              vitalSigns: true,
              ventilatorSettings: true,
              linesTubesDrains: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { admissionDate: "desc" },
      }),
      prisma.icuAdmission.count({ where }),
    ]);

    return {
      admissions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getAdmissionById(id: string) {
    const admission = await prisma.icuAdmission.findUnique({
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
            phone: true,
          },
        },
        admittingProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        dischargeProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
        ventilatorSettings: {
          orderBy: { recordedAt: "desc" },
          take: 5,
        },
        sedationAssessments: {
          orderBy: { assessedAt: "desc" },
          take: 5,
        },
        linesTubesDrains: {
          where: { isActive: true },
        },
        fluidBalances: {
          orderBy: { recordedAt: "desc" },
          take: 5,
        },
        dailyGoals: {
          orderBy: { goalDate: "desc" },
          take: 3,
        },
      },
    });

    if (!admission) {
      throw new Error("ICU Admission not found");
    }

    return admission;
  }

  async createAdmission(data: CreateIcuAdmissionInput) {
    const admissionNumber = await this.generateAdmissionNumber();

    return prisma.icuAdmission.create({
      data: {
        ...data,
        admissionNumber,
        admissionDate: new Date(),
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

  async updateAdmission(id: string, data: UpdateIcuAdmissionInput) {
    const admission = await prisma.icuAdmission.findUnique({ where: { id } });

    if (!admission) {
      throw new Error("ICU Admission not found");
    }

    if (data.apacheIIScore !== undefined && !admission.apacheIICalculatedAt) {
      data = { ...data, apacheIICalculatedAt: new Date() };
    }

    return prisma.icuAdmission.update({
      where: { id },
      data,
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

  async getActiveAdmissions() {
    return prisma.icuAdmission.findMany({
      where: {
        currentStatus: {
          notIn: ["DISCHARGED", "DECEASED"],
        },
      },
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
        admittingProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            linesTubesDrains: true,
          },
        },
      },
      orderBy: [
        { currentStatus: "asc" },
        { admissionDate: "desc" },
      ],
    });
  }

  async getAdmissionStats() {
    const stats = await prisma.icuAdmission.groupBy({
      by: ["currentStatus"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.icuAdmission.count({
      where: {
        admissionDate: {
          gte: today,
        },
      },
    });

    const activeCount = await prisma.icuAdmission.count({
      where: {
        currentStatus: {
          notIn: ["DISCHARGED", "DECEASED"],
        },
      },
    });

    const ventilatedCount = await prisma.icuAdmission.count({
      where: {
        isVentilated: true,
        currentStatus: {
          notIn: ["DISCHARGED", "DECEASED"],
        },
      },
    });

    return {
      byStatus: stats,
      today: todayCount,
      active: activeCount,
      ventilated: ventilatedCount,
    };
  }

  private async generateAdmissionNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const prefix = `ICU-${year}${month}${day}`;
    
    const lastAdmission = await prisma.icuAdmission.findFirst({
      where: {
        admissionNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        admissionNumber: "desc",
      },
    });

    let sequence = 1;
    if (lastAdmission) {
      const lastSequence = parseInt(lastAdmission.admissionNumber.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(3, "0")}`;
  }
}
