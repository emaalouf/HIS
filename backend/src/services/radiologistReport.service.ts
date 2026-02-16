import { PrismaClient, RadiologistReportStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createRadiologistReportSchema = z.object({
  studyId: z.string().uuid("Invalid study ID"),
  findings: z.string().min(1, "Findings are required"),
  impression: z.string().min(1, "Impression is required"),
  recommendations: z.string().optional(),
  comparisonStudyId: z.string().uuid().optional(),
  criticalFindings: z.boolean().default(false),
});

export const updateRadiologistReportSchema = z.object({
  findings: z.string().optional(),
  impression: z.string().optional(),
  recommendations: z.string().optional(),
  comparisonStudyId: z.string().uuid().optional(),
  criticalFindings: z.boolean().optional(),
});

export type CreateRadiologistReportInput = z.infer<typeof createRadiologistReportSchema>;
export type UpdateRadiologistReportInput = z.infer<typeof updateRadiologistReportSchema>;

export class RadiologistReportService {
  async getAllReports(
    filters: {
      studyId?: string;
      radiologistId?: string;
      status?: string;
      criticalOnly?: boolean;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.studyId) where.studyId = filters.studyId;
    if (filters.radiologistId) where.radiologistId = filters.radiologistId;
    if (filters.status) where.status = filters.status;
    if (filters.criticalOnly) where.criticalFindings = true;
    if (filters.dateFrom || filters.dateTo) {
      where.reportedAt = {};
      if (filters.dateFrom) where.reportedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.reportedAt.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { findings: { contains: filters.search, mode: "insensitive" } },
        { impression: { contains: filters.search, mode: "insensitive" } },
        {
          study: {
            patient: {
              OR: [
                { firstName: { contains: filters.search, mode: "insensitive" } },
                { lastName: { contains: filters.search, mode: "insensitive" } },
                { mrn: { contains: filters.search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.radiologistReport.findMany({
        where,
        include: {
          study: {
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
          },
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
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.radiologistReport.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getReportById(id: string) {
    const report = await prisma.radiologistReport.findUnique({
      where: { id },
      include: {
        study: {
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
            series: {
              include: {
                _count: {
                  select: {
                    instances: true,
                  },
                },
              },
            },
          },
        },
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
    });

    if (!report) {
      throw new Error("Report not found");
    }

    return report;
  }

  async createReport(data: CreateRadiologistReportInput, radiologistId: string) {
    const study = await prisma.imagingStudy.findUnique({
      where: { id: data.studyId },
    });

    if (!study) {
      throw new Error("Imaging study not found");
    }

    return prisma.radiologistReport.create({
      data: {
        ...data,
        radiologistId,
        status: "DRAFT",
      },
      include: {
        study: {
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
        },
        radiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateReport(id: string, data: UpdateRadiologistReportInput) {
    const report = await prisma.radiologistReport.findUnique({ where: { id } });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status === "VERIFIED") {
      throw new Error("Cannot update a verified report. Create an amendment instead.");
    }

    return prisma.radiologistReport.update({
      where: { id },
      data,
      include: {
        study: {
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
        },
      },
    });
  }

  async submitReport(id: string) {
    const report = await prisma.radiologistReport.findUnique({ where: { id } });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status !== "DRAFT") {
      throw new Error("Only draft reports can be submitted");
    }

    return prisma.radiologistReport.update({
      where: { id },
      data: {
        status: "PENDING_VERIFICATION",
        reportedAt: new Date(),
      },
      include: {
        study: {
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
        },
      },
    });
  }

  async verifyReport(id: string, verifyingRadiologistId: string) {
    const report = await prisma.radiologistReport.findUnique({ where: { id } });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status !== "PENDING_VERIFICATION") {
      throw new Error("Only pending reports can be verified");
    }

    return prisma.radiologistReport.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifyingRadiologistId,
        verifiedAt: new Date(),
      },
      include: {
        study: {
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
        },
        verifyingRadiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async amendReport(id: string, data: UpdateRadiologistReportInput, radiologistId: string) {
    const report = await prisma.radiologistReport.findUnique({ where: { id } });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status !== "VERIFIED") {
      throw new Error("Only verified reports can be amended");
    }

    return prisma.radiologistReport.update({
      where: { id },
      data: {
        ...data,
        status: "AMENDED",
      },
      include: {
        study: {
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
        },
      },
    });
  }

  async deleteReport(id: string) {
    const report = await prisma.radiologistReport.findUnique({ where: { id } });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.status === "VERIFIED") {
      throw new Error("Cannot delete a verified report");
    }

    return prisma.radiologistReport.delete({ where: { id } });
  }

  async getCriticalReports() {
    return prisma.radiologistReport.findMany({
      where: {
        criticalFindings: true,
        notificationSent: false,
        status: {
          in: ["PENDING_VERIFICATION", "VERIFIED", "AMENDED"],
        },
      },
      include: {
        study: {
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
        },
        radiologist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { reportedAt: "desc" },
    });
  }

  async markNotificationSent(id: string) {
    return prisma.radiologistReport.update({
      where: { id },
      data: { notificationSent: true },
    });
  }

  async getReportStats() {
    const stats = await prisma.radiologistReport.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.radiologistReport.count({
      where: {
        reportedAt: {
          gte: today,
        },
      },
    });

    const criticalCount = await prisma.radiologistReport.count({
      where: {
        criticalFindings: true,
        status: {
          in: ["PENDING_VERIFICATION", "VERIFIED", "AMENDED"],
        },
      },
    });

    return {
      byStatus: stats,
      today: todayCount,
      critical: criticalCount,
    };
  }
}
