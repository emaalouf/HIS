import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createTestPanelSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  testIds: z.array(z.string()).min(1, "At least one test is required"),
});

export const updateTestPanelSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  testIds: z.array(z.string()).optional(),
});

export type CreateTestPanelInput = z.infer<typeof createTestPanelSchema>;
export type UpdateTestPanelInput = z.infer<typeof updateTestPanelSchema>;

export class TestPanelService {
  async getAllPanels(
    filters: {
      search?: string;
      isActive?: boolean;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [panels, total] = await Promise.all([
      prisma.testPanel.findMany({
        where,
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
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { name: "asc" },
      }),
      prisma.testPanel.count({ where }),
    ]);

    return {
      panels,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getPanelById(id: string) {
    const panel = await prisma.testPanel.findUnique({
      where: { id },
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

    return panel;
  }

  async getPanelByCode(code: string) {
    const panel = await prisma.testPanel.findUnique({
      where: { code },
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

    return panel;
  }

  async createPanel(data: CreateTestPanelInput) {
    const existingPanel = await prisma.testPanel.findUnique({
      where: { code: data.code },
    });

    if (existingPanel) {
      throw new Error(`Test panel with code '${data.code}' already exists`);
    }

    const { testIds, ...panelData } = data;

    return prisma.testPanel.create({
      data: {
        ...panelData,
        items: {
          create: testIds.map((testId, index) => ({
            testId,
            order: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async updatePanel(id: string, data: UpdateTestPanelInput) {
    const panel = await prisma.testPanel.findUnique({ where: { id } });

    if (!panel) {
      throw new Error("Test panel not found");
    }

    if (data.code && data.code !== panel.code) {
      const existingPanel = await prisma.testPanel.findUnique({
        where: { code: data.code },
      });

      if (existingPanel) {
        throw new Error(`Test panel with code '${data.code}' already exists`);
      }
    }

    const { testIds, ...panelData } = data;

    const updateData: any = { ...panelData };

    if (testIds) {
      await prisma.labTestPanelItem.deleteMany({
        where: { panelId: id },
      });

      updateData.items = {
        create: testIds.map((testId, index) => ({
          testId,
          order: index,
        })),
      };
    }

    return prisma.testPanel.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async deletePanel(id: string) {
    const panel = await prisma.testPanel.findUnique({ where: { id } });

    if (!panel) {
      throw new Error("Test panel not found");
    }

    return prisma.testPanel.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
