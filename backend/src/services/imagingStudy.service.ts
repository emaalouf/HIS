import { PrismaClient, ImagingModality, ImagingStudyStatus, OrderPriority } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createImagingStudySchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  modality: z.enum([
    "XRAY", "CT", "MRI", "ULTRASOUND", "MAMMOGRAPHY", 
    "FLUOROSCOPY", "PET", "NUCLEAR_MEDICINE", "ANGIOGRAPHY", "DEXA"
  ]),
  studyDescription: z.string().min(1, "Study description is required"),
  bodyPart: z.string().optional(),
  referringPhysicianId: z.string().uuid().optional(),
  scheduledDate: z.date().optional(),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).default("ROUTINE"),
  clinicalHistory: z.string().optional(),
  indication: z.string().optional(),
  contrastUsed: z.boolean().default(false),
  contrastType: z.string().optional(),
  notes: z.string().optional(),
});

export const updateImagingStudySchema = z.object({
  modality: z.enum([
    "XRAY", "CT", "MRI", "ULTRASOUND", "MAMMOGRAPHY", 
    "FLUOROSCOPY", "PET", "NUCLEAR_MEDICINE", "ANGIOGRAPHY", "DEXA"
  ]).optional(),
  studyDescription: z.string().optional(),
  bodyPart: z.string().optional(),
  referringPhysicianId: z.string().uuid().optional(),
  scheduledDate: z.date().optional(),
  performedDate: z.date().optional(),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).optional(),
  status: z.enum(["ORDERED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  radiologistId: z.string().uuid().optional(),
  technicianId: z.string().uuid().optional(),
  clinicalHistory: z.string().optional(),
  indication: z.string().optional(),
  contrastUsed: z.boolean().optional(),
  contrastType: z.string().optional(),
  doseReport: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateImagingStudyInput = z.infer<typeof createImagingStudySchema>;
export type UpdateImagingStudyInput = z.infer<typeof updateImagingStudySchema>;

export class ImagingStudyService {
  async getAllStudies(
    filters: {
      patientId?: string;
      status?: string;
      modality?: string;
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
    if (filters.modality) where.modality = filters.modality;
    if (filters.priority) where.priority = filters.priority;
    if (filters.dateFrom || filters.dateTo) {
      where.scheduledDate = {};
      if (filters.dateFrom) where.scheduledDate.gte = filters.dateFrom;
      if (filters.dateTo) where.scheduledDate.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { accessionNumber: { contains: filters.search, mode: "insensitive" } },
        { studyDescription: { contains: filters.search, mode: "insensitive" } },
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

    const [studies, total] = await Promise.all([
      prisma.imagingStudy.findMany({
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
          referringPhysician: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          radiologist: {
            select: {
              id: true,
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
          _count: {
            select: {
              series: true,
              reports: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.imagingStudy.count({ where }),
    ]);

    return {
      studies,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getStudyById(id: string) {
    const study = await prisma.imagingStudy.findUnique({
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
        referringPhysician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        radiologist: {
          select: {
            id: true,
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
        series: {
          include: {
            _count: {
              select: {
                instances: true,
              },
            },
          },
        },
        reports: {
          include: {
            radiologist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            verifyingRadiologist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!study) {
      throw new Error("Imaging study not found");
    }

    return study;
  }

  async getStudyByAccessionNumber(accessionNumber: string) {
    const study = await prisma.imagingStudy.findUnique({
      where: { accessionNumber },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        series: {
          include: {
            instances: true,
          },
        },
        reports: true,
      },
    });

    return study;
  }

  async createStudy(data: CreateImagingStudyInput) {
    const accessionNumber = await this.generateAccessionNumber();

    return prisma.imagingStudy.create({
      data: {
        ...data,
        accessionNumber,
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

  async updateStudy(id: string, data: UpdateImagingStudyInput) {
    const study = await prisma.imagingStudy.findUnique({ where: { id } });

    if (!study) {
      throw new Error("Imaging study not found");
    }

    return prisma.imagingStudy.update({
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

  async deleteStudy(id: string) {
    const study = await prisma.imagingStudy.findUnique({ where: { id } });

    if (!study) {
      throw new Error("Imaging study not found");
    }

    return prisma.imagingStudy.delete({ where: { id } });
  }

  async getStudiesByModality(modality: ImagingModality) {
    return prisma.imagingStudy.findMany({
      where: { modality },
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
      orderBy: { createdAt: "desc" },
    });
  }

  async getStudiesByStatus(status: ImagingStudyStatus) {
    return prisma.imagingStudy.findMany({
      where: { status },
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
      orderBy: { scheduledDate: "asc" },
    });
  }

  private async generateAccessionNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const sequence = await prisma.imagingStudy.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `IMG-${year}-${(sequence + 1).toString().padStart(6, "0")}`;
  }

  async getStudyStats() {
    const stats = await prisma.imagingStudy.groupBy({
      by: ["status", "modality"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.imagingStudy.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const pendingSTAT = await prisma.imagingStudy.count({
      where: {
        status: {
          in: ["ORDERED", "SCHEDULED", "IN_PROGRESS"],
        },
        priority: "STAT",
      },
    });

    return {
      byStatusAndModality: stats,
      today: todayCount,
      pendingSTAT,
    };
  }

  async getPendingStudies() {
    return prisma.imagingStudy.findMany({
      where: {
        status: {
          in: ["ORDERED", "SCHEDULED"],
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
      },
      orderBy: [
        { priority: "desc" },
        { scheduledDate: "asc" },
      ],
    });
  }

  async getUnreportedStudies() {
    return prisma.imagingStudy.findMany({
      where: {
        status: "COMPLETED",
        reports: {
          none: {
            status: {
              in: ["VERIFIED", "AMENDED"],
            },
          },
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
      },
      orderBy: { performedDate: "asc" },
    });
  }
}
