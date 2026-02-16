import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createLabTestSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "HEMATOLOGY",
    "CHEMISTRY",
    "MICROBIOLOGY",
    "SEROLOGY",
    "IMMUNOLOGY",
    "MOLECULAR",
    "ENDOCRINOLOGY",
    "TOXICOLOGY",
    "URINALYSIS",
    "COAGULATION",
    "HISTOLOGY",
    "CYTOLOGY",
    "OTHER",
  ]),
  description: z.string().optional(),
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
  containerType: z.string().optional(),
  volumeRequired: z.number().optional(),
  turnaroundTime: z.number().default(60),
  requiresFasting: z.boolean().default(false),
  specialInstructions: z.string().optional(),
});

export const updateLabTestSchema = createLabTestSchema.partial();

export type CreateLabTestInput = z.infer<typeof createLabTestSchema>;
export type UpdateLabTestInput = z.infer<typeof updateLabTestSchema>;

export class LabTestService {
  async getAllTests(
    filters: {
      category?: string;
      specimenType?: string;
      isActive?: boolean;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.specimenType) where.specimenType = filters.specimenType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [tests, total] = await Promise.all([
      prisma.labTest.findMany({
        where,
        include: {
          referenceRanges: true,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { name: "asc" },
      }),
      prisma.labTest.count({ where }),
    ]);

    return {
      tests,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getTestById(id: string) {
    const test = await prisma.labTest.findUnique({
      where: { id },
      include: {
        referenceRanges: true,
        panelItems: {
          include: {
            panel: true,
          },
        },
      },
    });

    if (!test) {
      throw new Error("Lab test not found");
    }

    return test;
  }

  async getTestByCode(code: string) {
    const test = await prisma.labTest.findUnique({
      where: { code },
      include: {
        referenceRanges: true,
      },
    });

    return test;
  }

  async createTest(data: CreateLabTestInput) {
    const existingTest = await prisma.labTest.findUnique({
      where: { code: data.code },
    });

    if (existingTest) {
      throw new Error(`Lab test with code '${data.code}' already exists`);
    }

    return prisma.labTest.create({
      data,
      include: {
        referenceRanges: true,
      },
    });
  }

  async updateTest(id: string, data: UpdateLabTestInput) {
    const test = await prisma.labTest.findUnique({ where: { id } });

    if (!test) {
      throw new Error("Lab test not found");
    }

    if (data.code && data.code !== test.code) {
      const existingTest = await prisma.labTest.findUnique({
        where: { code: data.code },
      });

      if (existingTest) {
        throw new Error(`Lab test with code '${data.code}' already exists`);
      }
    }

    return prisma.labTest.update({
      where: { id },
      data,
      include: {
        referenceRanges: true,
      },
    });
  }

  async deleteTest(id: string) {
    const test = await prisma.labTest.findUnique({ where: { id } });

    if (!test) {
      throw new Error("Lab test not found");
    }

    return prisma.labTest.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTestsByCategory(category: string) {
    return prisma.labTest.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async getAllCategories() {
    const categories = await prisma.labTest.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    return categories.map((c) => c.category);
  }
}
