import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const wardInclude = {
    department: {
        select: {
            id: true,
            name: true,
        },
    },
};

export class WardService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
        departmentId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            isActive,
            departmentId,
            sortBy = 'name',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.WardWhereInput = {};

        if (isActive !== undefined) where.isActive = isActive;
        if (departmentId) where.departmentId = departmentId;

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [wards, total] = await Promise.all([
            prisma.ward.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: wardInclude,
            }),
            prisma.ward.count({ where }),
        ]);

        return { wards, total };
    }

    async findById(id: string) {
        return prisma.ward.findUnique({
            where: { id },
            include: wardInclude,
        });
    }

    async create(data: {
        name: string;
        departmentId?: string | null;
        notes?: string | null;
        isActive?: boolean;
    }) {
        return prisma.ward.create({
            data: {
                name: data.name,
                departmentId: data.departmentId || undefined,
                notes: data.notes ?? undefined,
                isActive: data.isActive ?? true,
            },
            include: wardInclude,
        });
    }

    async update(id: string, data: {
        name?: string;
        departmentId?: string | null;
        notes?: string | null;
        isActive?: boolean;
    }) {
        return prisma.ward.update({
            where: { id },
            data: {
                name: data.name,
                departmentId: data.departmentId ?? undefined,
                notes: data.notes ?? undefined,
                isActive: data.isActive,
            },
            include: wardInclude,
        });
    }

    async delete(id: string) {
        return prisma.ward.delete({
            where: { id },
        });
    }
}

export const wardService = new WardService();
