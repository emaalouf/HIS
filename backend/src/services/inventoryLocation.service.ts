import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createInventoryLocationSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  locationType: z.string().min(1, "Location type is required"),
  parentLocationId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  isTemperatureControlled: z.boolean().default(false),
  temperatureMin: z.number().optional(),
  temperatureMax: z.number().optional(),
  isSecure: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateInventoryLocationSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  locationType: z.string().min(1).optional(),
  parentLocationId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  isTemperatureControlled: z.boolean().optional(),
  temperatureMin: z.number().optional(),
  temperatureMax: z.number().optional(),
  isSecure: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export type CreateInventoryLocationInput = z.infer<typeof createInventoryLocationSchema>;
export type UpdateInventoryLocationInput = z.infer<typeof updateInventoryLocationSchema>;

export class InventoryLocationService {
  async getAllLocations(
    filters: {
      locationType?: string;
      isActive?: boolean;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ) {
    const where: any = {};

    if (filters.locationType) where.locationType = filters.locationType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { code: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.inventoryLocation.findMany({
        where,
        include: {
          parentLocation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              stock: true,
              childLocations: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { name: "asc" },
      }),
      prisma.inventoryLocation.count({ where }),
    ]);

    return {
      locations,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getAllLocationsTree() {
    const locations = await prisma.inventoryLocation.findMany({
      where: { isActive: true },
      include: {
        parentLocation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        childLocations: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
            locationType: true,
          },
        },
        _count: {
          select: {
            stock: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Build tree structure
    const buildTree = (parentId: string | null): any[] => {
      return locations
        .filter((loc) => loc.parentLocationId === parentId)
        .map((loc) => ({
          ...loc,
          children: buildTree(loc.id),
        }));
    };

    return buildTree(null);
  }

  async getLocationById(id: string) {
    return prisma.inventoryLocation.findUnique({
      where: { id },
      include: {
        parentLocation: true,
        childLocations: {
          where: { isActive: true },
        },
        stock: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
                unitOfMeasure: true,
                isExpirable: true,
              },
            },
          },
          orderBy: {
            item: {
              name: "asc",
            },
          },
        },
        transactions: {
          take: 10,
          orderBy: { transactionDate: "desc" },
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
            performedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async getLocationByCode(code: string) {
    return prisma.inventoryLocation.findUnique({
      where: { code },
      include: {
        stock: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async createLocation(data: CreateInventoryLocationInput) {
    // Check for duplicate code
    const existingCode = await prisma.inventoryLocation.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new Error(`Location with code ${data.code} already exists`);
    }

    // Validate parent location if provided
    if (data.parentLocationId) {
      const parent = await prisma.inventoryLocation.findUnique({
        where: { id: data.parentLocationId },
      });

      if (!parent) {
        throw new Error("Parent location not found");
      }

      if (!parent.isActive) {
        throw new Error("Parent location is not active");
      }
    }

    return prisma.inventoryLocation.create({
      data,
    });
  }

  async updateLocation(id: string, data: UpdateInventoryLocationInput) {
    const location = await prisma.inventoryLocation.findUnique({ where: { id } });
    if (!location) {
      throw new Error("Location not found");
    }

    // Check for duplicate code if changing
    if (data.code && data.code !== location.code) {
      const existingCode = await prisma.inventoryLocation.findUnique({
        where: { code: data.code },
      });
      if (existingCode) {
        throw new Error(`Location with code ${data.code} already exists`);
      }
    }

    // Validate parent location if changing
    if (data.parentLocationId !== undefined && data.parentLocationId !== null) {
      // Prevent making a location its own parent
      if (data.parentLocationId === id) {
        throw new Error("A location cannot be its own parent");
      }

      // Prevent circular reference
      const isDescendant = await this.isDescendant(id, data.parentLocationId);
      if (isDescendant) {
        throw new Error("Cannot set a descendant as parent");
      }

      const parent = await prisma.inventoryLocation.findUnique({
        where: { id: data.parentLocationId },
      });

      if (!parent) {
        throw new Error("Parent location not found");
      }
    }

    return prisma.inventoryLocation.update({
      where: { id },
      data,
    });
  }

  private async isDescendant(parentId: string, childId: string): Promise<boolean> {
    const child = await prisma.inventoryLocation.findUnique({
      where: { id: childId },
      select: { parentLocationId: true },
    });

    if (!child || !child.parentLocationId) {
      return false;
    }

    if (child.parentLocationId === parentId) {
      return true;
    }

    return this.isDescendant(parentId, child.parentLocationId);
  }

  async deleteLocation(id: string) {
    const location = await prisma.inventoryLocation.findUnique({
      where: { id },
      include: {
        stock: true,
        childLocations: true,
      },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    // Check for stock
    const hasStock = location.stock.some((s) => s.quantityOnHand > 0);
    if (hasStock) {
      throw new Error("Cannot delete location with existing stock");
    }

    // Check for child locations
    if (location.childLocations.length > 0) {
      throw new Error("Cannot delete location with child locations");
    }

    // Delete stock records with zero quantity
    await prisma.inventoryStock.deleteMany({
      where: { locationId: id },
    });

    return prisma.inventoryLocation.delete({ where: { id } });
  }

  async getLocationStats() {
    const [
      totalLocations,
      byType,
      temperatureControlled,
      secureLocations,
    ] = await Promise.all([
      prisma.inventoryLocation.count(),
      prisma.inventoryLocation.groupBy({
        by: ["locationType"],
        _count: {
          id: true,
        },
      }),
      prisma.inventoryLocation.count({
        where: { isTemperatureControlled: true },
      }),
      prisma.inventoryLocation.count({
        where: { isSecure: true },
      }),
    ]);

    return {
      totalLocations,
      temperatureControlled,
      secureLocations,
      byType: byType.map((t) => ({
        type: t.locationType,
        count: t._count.id,
      })),
    };
  }
}
