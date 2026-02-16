import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createSpecimenSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  specimenType: z.enum([
    "BLOOD",
    "SERUM",
    "PLASMA",
    "URINE",
    "STOOL",
    "CSF",
    "SPUTUM",
    "SWAB",
    "TISSUE",
    "FLUID",
    "BONE_MARROW",
    "OTHER",
  ]),
  collectionSite: z.string().optional(),
  volumeCollected: z.number().optional(),
  collectionNotes: z.string().optional(),
});

export const updateSpecimenSchema = z.object({
  receivedTime: z.date().optional(),
  receptionNotes: z.string().optional(),
  storageLocation: z.string().optional(),
  status: z.enum(["ORDERED", "COLLECTED", "RECEIVED", "PROCESSING", "COMPLETED", "REJECTED"]).optional(),
  rejectionReason: z.string().optional(),
});

export const receiveSpecimenSchema = z.object({
  receptionNotes: z.string().optional(),
  storageLocation: z.string().optional(),
});

export type CreateSpecimenInput = z.infer<typeof createSpecimenSchema>;
export type UpdateSpecimenInput = z.infer<typeof updateSpecimenSchema>;
export type ReceiveSpecimenInput = z.infer<typeof receiveSpecimenSchema>;

export class SpecimenService {
  async getAllSpecimens(
    filters: {
      patientId?: string;
      status?: string;
      specimenType?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;
    if (filters.specimenType) where.specimenType = filters.specimenType;
    if (filters.dateFrom || filters.dateTo) {
      where.collectionTime = {};
      if (filters.dateFrom) where.collectionTime.gte = filters.dateFrom;
      if (filters.dateTo) where.collectionTime.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { barcode: { contains: filters.search, mode: "insensitive" } },
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

    const [specimens, total] = await Promise.all([
      prisma.specimen.findMany({
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
          collectedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          workOrders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { collectionTime: "desc" },
      }),
      prisma.specimen.count({ where }),
    ]);

    return {
      specimens,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getSpecimenById(id: string) {
    const specimen = await prisma.specimen.findUnique({
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
        collectedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        workOrders: {
          include: {
            items: {
              include: {
                test: true,
              },
            },
          },
        },
      },
    });

    if (!specimen) {
      throw new Error("Specimen not found");
    }

    return specimen;
  }

  async getSpecimenByBarcode(barcode: string) {
    const specimen = await prisma.specimen.findUnique({
      where: { barcode },
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
        workOrders: {
          include: {
            items: {
              include: {
                test: true,
              },
            },
          },
        },
      },
    });

    return specimen;
  }

  async createSpecimen(data: CreateSpecimenInput, collectedById: string) {
    const barcode = await this.generateBarcode();

    return prisma.specimen.create({
      data: {
        ...data,
        barcode,
        collectedById,
        status: "COLLECTED",
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
        collectedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async receiveSpecimen(id: string, data: ReceiveSpecimenInput, receivedById: string) {
    const specimen = await prisma.specimen.findUnique({ where: { id } });

    if (!specimen) {
      throw new Error("Specimen not found");
    }

    if (specimen.status !== "COLLECTED") {
      throw new Error("Specimen must be collected before it can be received");
    }

    return prisma.specimen.update({
      where: { id },
      data: {
        ...data,
        receivedTime: new Date(),
        receivedById,
        status: "RECEIVED",
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
        receivedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async rejectSpecimen(id: string, reason: string, userId: string) {
    const specimen = await prisma.specimen.findUnique({ where: { id } });

    if (!specimen) {
      throw new Error("Specimen not found");
    }

    if (specimen.status === "COMPLETED") {
      throw new Error("Cannot reject a completed specimen");
    }

    return prisma.specimen.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
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

  async updateSpecimen(id: string, data: UpdateSpecimenInput) {
    const specimen = await prisma.specimen.findUnique({ where: { id } });

    if (!specimen) {
      throw new Error("Specimen not found");
    }

    return prisma.specimen.update({
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

  private async generateBarcode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const prefix = `SP${year}${month}${day}`;
    
    const lastSpecimen = await prisma.specimen.findFirst({
      where: {
        barcode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        barcode: "desc",
      },
    });

    let sequence = 1;
    if (lastSpecimen) {
      const lastSequence = parseInt(lastSpecimen.barcode.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, "0")}`;
  }

  async getSpecimenStats() {
    const stats = await prisma.specimen.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.specimen.count({
      where: {
        collectionTime: {
          gte: today,
        },
      },
    });

    return {
      byStatus: stats,
      today: todayCount,
    };
  }
}
