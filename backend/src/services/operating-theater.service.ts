import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const operatingTheaterInclude = {
    surgeries: {
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
};

export class OperatingTheaterService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            status,
            sortBy = 'name',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OperatingTheaterWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { location: { contains: search } },
            ];
        }

        const [theaters, total] = await Promise.all([
            prisma.operatingTheater.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: operatingTheaterInclude,
            }),
            prisma.operatingTheater.count({ where }),
        ]);

        return { theaters, total };
    }

    async findById(id: string) {
        return prisma.operatingTheater.findUnique({
            where: { id },
            include: operatingTheaterInclude,
        });
    }

    async create(data: {
        name: string;
        location?: string | null;
        status?: string;
        notes?: string | null;
    }) {
        return prisma.operatingTheater.create({
            data: {
                name: data.name,
                location: data.location ?? undefined,
                status: data.status ?? 'ACTIVE',
                notes: data.notes ?? undefined,
            },
            include: operatingTheaterInclude,
        });
    }

    async update(id: string, data: {
        name?: string;
        location?: string | null;
        status?: string;
        notes?: string | null;
    }) {
        return prisma.operatingTheater.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location ?? undefined,
                status: data.status,
                notes: data.notes ?? undefined,
            },
            include: operatingTheaterInclude,
        });
    }

    async delete(id: string) {
        return prisma.operatingTheater.delete({
            where: { id },
        });
    }
}

export const operatingTheaterService = new OperatingTheaterService();