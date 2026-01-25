import { BedStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const bedInclude = {
    ward: {
        select: {
            id: true,
            name: true,
        },
    },
};

export class BedService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: BedStatus;
        wardId?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            status,
            wardId,
            isActive,
            sortBy = 'bedLabel',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.BedWhereInput = {};

        if (status) where.status = status;
        if (wardId) where.wardId = wardId;
        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { bedLabel: { contains: search } },
                { roomNumber: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [beds, total] = await Promise.all([
            prisma.bed.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: bedInclude,
            }),
            prisma.bed.count({ where }),
        ]);

        return { beds, total };
    }

    async findById(id: string) {
        return prisma.bed.findUnique({
            where: { id },
            include: bedInclude,
        });
    }

    async create(data: {
        wardId: string;
        roomNumber?: string | null;
        bedLabel: string;
        status?: BedStatus;
        isActive?: boolean;
        notes?: string | null;
    }) {
        return prisma.bed.create({
            data: {
                wardId: data.wardId,
                roomNumber: data.roomNumber ?? undefined,
                bedLabel: data.bedLabel,
                status: data.status,
                isActive: data.isActive ?? true,
                notes: data.notes ?? undefined,
            },
            include: bedInclude,
        });
    }

    async update(id: string, data: {
        wardId?: string;
        roomNumber?: string | null;
        bedLabel?: string;
        status?: BedStatus;
        isActive?: boolean;
        notes?: string | null;
    }) {
        return prisma.bed.update({
            where: { id },
            data: {
                wardId: data.wardId,
                roomNumber: data.roomNumber ?? undefined,
                bedLabel: data.bedLabel,
                status: data.status,
                isActive: data.isActive,
                notes: data.notes ?? undefined,
            },
            include: bedInclude,
        });
    }

    async delete(id: string) {
        return prisma.bed.delete({
            where: { id },
        });
    }
}

export const bedService = new BedService();
