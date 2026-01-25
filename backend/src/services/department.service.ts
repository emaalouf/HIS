import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class DepartmentService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            isActive,
            sortBy = 'name',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DepartmentWhereInput = {};

        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [departments, total] = await Promise.all([
            prisma.department.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.department.count({ where }),
        ]);

        return { departments, total };
    }

    async findById(id: string) {
        return prisma.department.findUnique({
            where: { id },
        });
    }

    async create(data: {
        name: string;
        description?: string | null;
        isActive?: boolean;
    }) {
        return prisma.department.create({
            data: {
                name: data.name,
                description: data.description ?? undefined,
                isActive: data.isActive ?? true,
            },
        });
    }

    async update(id: string, data: {
        name?: string;
        description?: string | null;
        isActive?: boolean;
    }) {
        return prisma.department.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description ?? undefined,
                isActive: data.isActive,
            },
        });
    }

    async delete(id: string) {
        return prisma.department.delete({
            where: { id },
        });
    }
}

export const departmentService = new DepartmentService();
