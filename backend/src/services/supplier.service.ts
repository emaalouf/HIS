import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createSupplierSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("USA"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  fax: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().default("USD"),
  isPreferred: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateSupplierSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  fax: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
  isPreferred: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  performanceScore: z.number().optional(),
  notes: z.string().optional(),
});

export const addSupplierItemSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier ID"),
  itemId: z.string().uuid("Invalid item ID"),
  supplierSku: z.string().optional(),
  supplierName: z.string().optional(),
  unitCost: z.number().min(0, "Unit cost must be non-negative"),
  minOrderQty: z.number().int().min(1).default(1),
  leadTimeDays: z.number().int().optional(),
  isPrimary: z.boolean().default(false),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type AddSupplierItemInput = z.infer<typeof addSupplierItemSchema>;

export class SupplierService {
  async getAllSuppliers(
    filters: {
      isActive?: boolean;
      isPreferred?: boolean;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.isPreferred !== undefined) where.isPreferred = filters.isPreferred;
    if (filters.search) {
      where.OR = [
        { code: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
        { contactPerson: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              purchaseOrders: true,
              itemsSupplied: true,
            },
          },
          purchaseOrders: {
            where: { status: { not: "CLOSED" } },
            select: {
              id: true,
              poNumber: true,
              status: true,
              totalAmount: true,
            },
            take: 5,
            orderBy: { poDate: "desc" },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { name: "asc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getSupplierById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        itemsSupplied: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                unitOfMeasure: true,
                category: true,
              },
            },
          },
        },
        purchaseOrders: {
          include: {
            items: {
              include: {
                item: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
          orderBy: { poDate: "desc" },
        },
      },
    });
  }

  async getSupplierByCode(code: string) {
    return prisma.supplier.findUnique({
      where: { code },
      include: {
        itemsSupplied: {
          where: { isActive: true },
          include: {
            item: true,
          },
        },
      },
    });
  }

  async createSupplier(data: CreateSupplierInput) {
    // Check for duplicate code
    const existingCode = await prisma.supplier.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new Error(`Supplier with code ${data.code} already exists`);
    }

    return prisma.supplier.create({
      data,
    });
  }

  async updateSupplier(id: string, data: UpdateSupplierInput) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Check for duplicate code if changing
    if (data.code && data.code !== supplier.code) {
      const existingCode = await prisma.supplier.findUnique({
        where: { code: data.code },
      });
      if (existingCode) {
        throw new Error(`Supplier with code ${data.code} already exists`);
      }
    }

    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async deleteSupplier(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
      },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Check for active POs
    const activePOs = supplier.purchaseOrders.filter(
      (po) => !["CLOSED", "CANCELLED"].includes(po.status)
    );

    if (activePOs.length > 0) {
      throw new Error("Cannot delete supplier with active purchase orders");
    }

    return prisma.supplier.delete({ where: { id } });
  }

  async addSupplierItem(data: AddSupplierItemInput) {
    const { supplierId, itemId, isPrimary } = data;

    // Check if supplier-item combination already exists
    const existing = await prisma.supplierItem.findUnique({
      where: {
        supplierId_itemId: {
          supplierId,
          itemId,
        },
      },
    });

    if (existing) {
      throw new Error("This item is already associated with this supplier");
    }

    // If setting as primary, unset other primaries for this item
    if (isPrimary) {
      await prisma.supplierItem.updateMany({
        where: {
          itemId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.supplierItem.create({
      data,
    });
  }

  async updateSupplierItem(id: string, data: Partial<AddSupplierItemInput>) {
    const supplierItem = await prisma.supplierItem.findUnique({
      where: { id },
    });

    if (!supplierItem) {
      throw new Error("Supplier item not found");
    }

    // If setting as primary, unset other primaries for this item
    if (data.isPrimary && !supplierItem.isPrimary) {
      await prisma.supplierItem.updateMany({
        where: {
          itemId: supplierItem.itemId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.supplierItem.update({
      where: { id },
      data,
    });
  }

  async removeSupplierItem(id: string) {
    const supplierItem = await prisma.supplierItem.findUnique({
      where: { id },
    });

    if (!supplierItem) {
      throw new Error("Supplier item not found");
    }

    return prisma.supplierItem.delete({
      where: { id },
    });
  }

  async getSupplierStats() {
    const [
      totalSuppliers,
      activeSuppliers,
      preferredSuppliers,
      suppliersByRating,
    ] = await Promise.all([
      prisma.supplier.count(),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { isPreferred: true } }),
      prisma.supplier.groupBy({
        by: ["rating"],
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      totalSuppliers,
      activeSuppliers,
      preferredSuppliers,
      suppliersByRating: suppliersByRating.map((r) => ({
        rating: r.rating || "Unrated",
        count: r._count.id,
      })),
    };
  }

  async getSuppliersForItem(itemId: string) {
    return prisma.supplierItem.findMany({
      where: {
        itemId,
        isActive: true,
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true,
            isPreferred: true,
            rating: true,
            paymentTerms: true,
          },
        },
      },
      orderBy: [
        { isPrimary: "desc" },
        { supplier: { isPreferred: "desc" } },
      ],
    });
  }
}
