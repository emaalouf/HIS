import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class SpecialtyService {
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
        const allowedSortFields = new Set(['name', 'createdAt', 'updatedAt', 'isActive']);
        const resolvedSortBy = allowedSortFields.has(sortBy) ? sortBy : 'name';

        const where: Prisma.SpecialtyWhereInput = {};

        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [specialties, total] = await Promise.all([
            prisma.specialty.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [resolvedSortBy]: sortOrder },
            }),
            prisma.specialty.count({ where }),
        ]);

        return { specialties, total };
    }

    async findById(id: string) {
        return prisma.specialty.findUnique({
            where: { id },
        });
    }

    async create(data: {
        name: string;
        description?: string | null;
        isActive?: boolean;
    }) {
        return prisma.specialty.create({
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
        return prisma.specialty.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description ?? undefined,
                isActive: data.isActive,
            },
        });
    }

    async delete(id: string) {
        return prisma.specialty.delete({
            where: { id },
        });
    }
}

export const specialtyService = new SpecialtyService();
