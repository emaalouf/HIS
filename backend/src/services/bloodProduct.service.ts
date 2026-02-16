import { PrismaClient, BloodTypeBB, BloodProductType, BloodProductStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const createBloodProductSchema = z.object({
  donationId: z.string().uuid("Invalid donation ID"),
  productType: z.enum(["WHOLE_BLOOD", "PRBC", "FFP", "PLATELETS", "CRYOPRECIPITATE", "GRANULOCYTES", "ALBUMIN", "IVIG"]),
  bloodType: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]),
  volume: z.number().min(1, "Volume must be greater than 0"),
  storageLocation: z.string().optional(),
  storageTemp: z.number().optional(),
  notes: z.string().optional(),
});

export const updateBloodProductSchema = z.object({
  status: z.enum(["AVAILABLE", "RESERVED", "QUARANTINE", "EXPIRED", "DISCARDED", "TRANSFUSED"]).optional(),
  storageLocation: z.string().optional(),
  storageTemp: z.number().optional(),
  reservedForId: z.string().uuid().optional(),
  reservedUntil: z.date().optional(),
  qcPassed: z.boolean().optional(),
  notes: z.string().optional(),
});

export type CreateBloodProductInput = z.infer<typeof createBloodProductSchema>;
export type UpdateBloodProductInput = z.infer<typeof updateBloodProductSchema>;

export class BloodProductService {
  async getAllProducts(
    filters: {
      productType?: string;
      bloodType?: string;
      status?: string;
      search?: string;
      expiringBefore?: Date;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const where: any = {};

    if (filters.productType) where.productType = filters.productType;
    if (filters.bloodType) where.bloodType = filters.bloodType;
    if (filters.status) where.status = filters.status;
    if (filters.expiringBefore) {
      where.expirationDate = { lte: filters.expiringBefore };
    }
    if (filters.search) {
      where.OR = [
        { productCode: { contains: filters.search, mode: "insensitive" } },
        { storageLocation: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.bloodProduct.findMany({
        where,
        include: {
          donation: {
            include: {
              donor: {
                select: {
                  firstName: true,
                  lastName: true,
                  donorId: true,
                },
              },
            },
          },
          reservedFor: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { expirationDate: "asc" },
      }),
      prisma.bloodProduct.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.bloodProduct.findUnique({
      where: { id },
      include: {
        donation: {
          include: {
            donor: true,
          },
        },
        reservedFor: true,
        crossMatches: {
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

    if (!product) {
      throw new Error("Blood product not found");
    }

    return product;
  }

  async createProduct(data: CreateBloodProductInput) {
    const productCode = await this.generateProductCode(data.productType);

    const donation = await prisma.bloodDonation.findUnique({
      where: { id: data.donationId },
    });

    if (!donation) {
      throw new Error("Blood donation not found");
    }

    // Calculate expiration date based on product type
    const expirationDate = this.calculateExpirationDate(data.productType);

    return prisma.bloodProduct.create({
      data: {
        ...data,
        productCode,
        collectionDate: donation.donationDate,
        expirationDate,
      },
      include: {
        donation: {
          include: {
            donor: {
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

  async updateProduct(id: string, data: UpdateBloodProductInput) {
    const product = await prisma.bloodProduct.findUnique({ where: { id } });

    if (!product) {
      throw new Error("Blood product not found");
    }

    return prisma.bloodProduct.update({
      where: { id },
      data,
      include: {
        reservedFor: {
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

  async getInventoryByBloodType() {
    const inventory = await prisma.bloodProduct.groupBy({
      by: ["bloodType", "productType"],
      where: {
        status: "AVAILABLE",
        expirationDate: {
          gt: new Date(),
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        volume: true,
      },
    });

    return inventory;
  }

  async getExpiringProducts(days: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return prisma.bloodProduct.findMany({
      where: {
        expirationDate: {
          lte: cutoffDate,
          gt: new Date(),
        },
        status: {
          in: ["AVAILABLE", "QUARANTINE"],
        },
      },
      include: {
        donation: {
          include: {
            donor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { expirationDate: "asc" },
    });
  }

  async getLowStockProducts(threshold: number = 10) {
    const stockCounts = await prisma.bloodProduct.groupBy({
      by: ["bloodType", "productType"],
      where: {
        status: "AVAILABLE",
        expirationDate: {
          gt: new Date(),
        },
      },
      _count: {
        id: true,
      },
    });

    return stockCounts.filter((item) => item._count.id < threshold);
  }

  private async generateProductCode(productType: BloodProductType): Promise<string> {
    const prefix = productType.substring(0, 3);
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const sequence = await prisma.bloodProduct.count({
      where: {
        productCode: {
          startsWith: `${prefix}-${year}`,
        },
      },
    });

    return `${prefix}-${year}-${(sequence + 1).toString().padStart(5, "0")}`;
  }

  private calculateExpirationDate(productType: BloodProductType): Date {
    const now = new Date();
    
    switch (productType) {
      case "WHOLE_BLOOD":
        now.setDate(now.getDate() + 35);
        break;
      case "PRBC":
        now.setDate(now.getDate() + 42);
        break;
      case "FFP":
        now.setFullYear(now.getFullYear() + 1);
        break;
      case "PLATELETS":
        now.setDate(now.getDate() + 5);
        break;
      case "CRYOPRECIPITATE":
        now.setFullYear(now.getFullYear() + 1);
        break;
      default:
        now.setDate(now.getDate() + 35);
    }

    return now;
  }
}
