import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createReferenceRangeSchema = z.object({
  testId: z.string().uuid("Invalid test ID"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  ageMin: z.number().optional(),
  ageMax: z.number().optional(),
  lowValue: z.number().optional(),
  highValue: z.number().optional(),
  criticalLow: z.number().optional(),
  criticalHigh: z.number().optional(),
  isDefault: z.boolean().default(false),
  referenceText: z.string().optional(),
});

export const updateReferenceRangeSchema = createReferenceRangeSchema.partial();

export type CreateReferenceRangeInput = z.infer<typeof createReferenceRangeSchema>;
export type UpdateReferenceRangeInput = z.infer<typeof updateReferenceRangeSchema>;

export class ReferenceRangeService {
  async getAllRanges(
    filters: {
      testId?: string;
      gender?: string;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.testId) where.testId = filters.testId;
    if (filters.gender) where.gender = filters.gender;
    if (filters.search) {
      where.test = {
        name: { contains: filters.search, mode: "insensitive" },
      };
    }

    const [ranges, total] = await Promise.all([
      prisma.referenceRange.findMany({
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
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: {
          test: {
            name: "asc",
          },
        },
      }),
      prisma.referenceRange.count({ where }),
    ]);

    return {
      ranges,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getRangeById(id: string) {
    const range = await prisma.referenceRange.findUnique({
      where: { id },
      include: {
        test: true,
      },
    });

    if (!range) {
      throw new Error("Reference range not found");
    }

    return range;
  }

  async getRangesByTestId(testId: string) {
    return prisma.referenceRange.findMany({
      where: { testId },
      orderBy: [{ gender: "asc" }, { ageMin: "asc" }],
    });
  }

  async createRange(data: CreateReferenceRangeInput) {
    const test = await prisma.labTest.findUnique({
      where: { id: data.testId },
    });

    if (!test) {
      throw new Error("Lab test not found");
    }

    return prisma.referenceRange.create({
      data,
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
    });
  }

  async updateRange(id: string, data: UpdateReferenceRangeInput) {
    const range = await prisma.referenceRange.findUnique({ where: { id } });

    if (!range) {
      throw new Error("Reference range not found");
    }

    return prisma.referenceRange.update({
      where: { id },
      data,
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
    });
  }

  async deleteRange(id: string) {
    const range = await prisma.referenceRange.findUnique({ where: { id } });

    if (!range) {
      throw new Error("Reference range not found");
    }

    return prisma.referenceRange.delete({
      where: { id },
    });
  }

  async getApplicableRange(
    testId: string,
    gender: string,
    dateOfBirth: Date
  ) {
    const ageInMonths = this.calculateAgeInMonths(dateOfBirth);

    const ranges = await prisma.referenceRange.findMany({
      where: {
        testId,
        OR: [
          { gender: null },
          { gender },
        ],
      },
    });

    const applicableRange = ranges.find((range) => {
      const ageMatch =
        (!range.ageMin || ageInMonths >= range.ageMin) &&
        (!range.ageMax || ageInMonths <= range.ageMax);
      return ageMatch;
    });

    if (applicableRange) {
      return applicableRange;
    }

    return ranges.find((range) => range.isDefault);
  }

  private calculateAgeInMonths(dateOfBirth: Date): number {
    const now = new Date();
    const birth = new Date(dateOfBirth);
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return years * 12 + months;
  }
}
