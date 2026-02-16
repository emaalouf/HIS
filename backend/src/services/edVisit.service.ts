import { PrismaClient, EDVisitStatus, ESI, EDDisposition, OrderPriority } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createEDVisitSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  arrivalMode: z.string().optional(),
  historyOfPresentIllness: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
});

export const updateEDVisitSchema = z.object({
  chiefComplaint: z.string().optional(),
  currentStatus: z.enum([
    "PENDING", "TRIAGE", "IN_PROGRESS", "UNDER_OBSERVATION", 
    "WAITING_RESULTS", "READY_FOR_DISCHARGE", "DISCHARGED", 
    "ADMITTED", "TRANSFERRED", "LEFT_WITHOUT_BEING_SEEN", "DECEASED"
  ]).optional(),
  triageLevel: z.enum(["ESI_1", "ESI_2", "ESI_3", "ESI_4", "ESI_5"]).optional(),
  triageTime: z.date().optional(),
  triageNurseId: z.string().uuid().optional(),
  triageTemperature: z.number().optional(),
  triageHeartRate: z.number().optional(),
  triageRespiratoryRate: z.number().optional(),
  triageBloodPressure: z.string().optional(),
  triageOxygenSaturation: z.number().optional(),
  triagePainScore: z.number().optional(),
  triageGlasgowComaScore: z.number().optional(),
  assignedProviderId: z.string().uuid().optional(),
  bedAssignment: z.string().optional(),
  bedAssignmentTime: z.date().optional(),
  physicalExamination: z.string().optional(),
  differentialDiagnosis: z.string().optional(),
  finalDiagnosis: z.string().optional(),
  labsOrdered: z.string().optional(),
  imagingOrdered: z.string().optional(),
  proceduresPerformed: z.string().optional(),
  medicationsGiven: z.string().optional(),
  providerFirstContactTime: z.date().optional(),
  roomAssignmentTime: z.date().optional(),
  firstLabResultsTime: z.date().optional(),
  firstImagingResultsTime: z.date().optional(),
  dispositionDecisionTime: z.date().optional(),
  dischargeTime: z.date().optional(),
  disposition: z.enum([
    "DISCHARGE_HOME", "ADMIT_TO_WARD", "ADMIT_TO_ICU", 
    "TRANSFER_TO_ANOTHER_HOSPITAL", "TRANSFER_TO_ANOTHER_ED", 
    "LEAVE_AMA", "DEATH"
  ]).optional(),
  dispositionNotes: z.string().optional(),
  consultationsRequested: z.string().optional(),
  cardiacArrest: z.boolean().optional(),
  intubationPerformed: z.boolean().optional(),
  cprPerformed: z.boolean().optional(),
  followUpInstructions: z.string().optional(),
  followUpRecommended: z.boolean().optional(),
  followUpWithin: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateEDVisitInput = z.infer<typeof createEDVisitSchema>;
export type UpdateEDVisitInput = z.infer<typeof updateEDVisitSchema>;

export class EDVisitService {
  async getAllVisits(
    filters: {
      patientId?: string;
      status?: string;
      triageLevel?: string;
      assignedProviderId?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.currentStatus = filters.status;
    if (filters.triageLevel) where.triageLevel = filters.triageLevel;
    if (filters.assignedProviderId) where.assignedProviderId = filters.assignedProviderId;
    if (filters.dateFrom || filters.dateTo) {
      where.arrivalTime = {};
      if (filters.dateFrom) where.arrivalTime.gte = filters.dateFrom;
      if (filters.dateTo) where.arrivalTime.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { visitNumber: { contains: filters.search, mode: "insensitive" } },
        { chiefComplaint: { contains: filters.search, mode: "insensitive" } },
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

    const [visits, total] = await Promise.all([
      prisma.eDVisit.findMany({
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
          assignedProvider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          triageNurse: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              procedures: true,
              flowRecords: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { arrivalTime: "desc" },
      }),
      prisma.eDVisit.count({ where }),
    ]);

    return {
      visits,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getVisitById(id: string) {
    const visit = await prisma.eDVisit.findUnique({
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
        assignedProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        triageNurse: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        triageEvents: {
          include: {
            triageNurse: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { triageTime: "desc" },
        },
        procedures: {
          include: {
            performedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { procedureTime: "desc" },
        },
        flowRecords: {
          include: {
            provider: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!visit) {
      throw new Error("ED Visit not found");
    }

    return visit;
  }

  async createVisit(data: CreateEDVisitInput) {
    const visitNumber = await this.generateVisitNumber();
    
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { dateOfBirth: true, gender: true },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    const ageAtVisit = this.calculateAge(patient.dateOfBirth);

    return prisma.eDVisit.create({
      data: {
        ...data,
        visitNumber,
        arrivalTime: new Date(),
        ageAtVisit,
        genderAtVisit: patient.gender,
        currentStatus: "PENDING",
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

  async updateVisit(id: string, data: UpdateEDVisitInput) {
    const visit = await prisma.eDVisit.findUnique({ where: { id } });

    if (!visit) {
      throw new Error("ED Visit not found");
    }

    return prisma.eDVisit.update({
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

  async getActiveVisits() {
    return prisma.eDVisit.findMany({
      where: {
        currentStatus: {
          notIn: ["DISCHARGED", "ADMITTED", "TRANSFERRED", "LEFT_WITHOUT_BEING_SEEN", "DECEASED"],
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
        assignedProvider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { triageLevel: "asc" },
        { arrivalTime: "asc" },
      ],
    });
  }

  async getVisitsByStatus(status: EDVisitStatus) {
    return prisma.eDVisit.findMany({
      where: { currentStatus: status },
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
      orderBy: { arrivalTime: "desc" },
    });
  }

  async getVisitStats() {
    const stats = await prisma.eDVisit.groupBy({
      by: ["currentStatus"],
      _count: {
        id: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.eDVisit.count({
      where: {
        arrivalTime: {
          gte: today,
        },
      },
    });

    const activeCount = await prisma.eDVisit.count({
      where: {
        currentStatus: {
          notIn: ["DISCHARGED", "ADMITTED", "TRANSFERRED", "LEFT_WITHOUT_BEING_SEEN", "DECEASED"],
        },
      },
    });

    const criticalCount = await prisma.eDVisit.count({
      where: {
        triageLevel: "ESI_1",
        currentStatus: {
          notIn: ["DISCHARGED", "ADMITTED", "TRANSFERRED", "DECEASED"],
        },
      },
    });

    return {
      byStatus: stats,
      today: todayCount,
      active: activeCount,
      critical: criticalCount,
    };
  }

  private async generateVisitNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    const prefix = `ED-${year}${month}${day}`;
    
    const lastVisit = await prisma.eDVisit.findFirst({
      where: {
        visitNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        visitNumber: "desc",
      },
    });

    let sequence = 1;
    if (lastVisit) {
      const lastSequence = parseInt(lastVisit.visitNumber.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(3, "0")}`;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
