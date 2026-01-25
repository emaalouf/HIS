import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class DialysisStationService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            status,
            isActive,
            sortBy = 'name',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisStationWhereInput = {};

        if (status) where.status = status as any;
        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { room: { contains: search } },
                { machineNumber: { contains: search } },
            ];
        }

        const [stations, total] = await Promise.all([
            prisma.dialysisStation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.dialysisStation.count({ where }),
        ]);

        return { stations, total };
    }

    async findById(id: string) {
        return prisma.dialysisStation.findUnique({
            where: { id },
        });
    }

    async create(data: {
        name: string;
        room?: string | null;
        machineNumber?: string | null;
        status?: string;
        lastServiceDate?: string;
        nextServiceDate?: string;
        notes?: string | null;
        isActive?: boolean;
    }) {
        return prisma.dialysisStation.create({
            data: {
                name: data.name,
                room: data.room ?? undefined,
                machineNumber: data.machineNumber ?? undefined,
                status: data.status as any,
                lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : undefined,
                nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined,
                notes: data.notes ?? undefined,
                isActive: data.isActive,
            },
        });
    }

    async update(id: string, data: {
        name?: string;
        room?: string | null;
        machineNumber?: string | null;
        status?: string;
        lastServiceDate?: string;
        nextServiceDate?: string;
        notes?: string | null;
        isActive?: boolean;
    }) {
        const updateData: Prisma.DialysisStationUncheckedUpdateInput = {
            name: data.name,
            room: data.room ?? undefined,
            machineNumber: data.machineNumber ?? undefined,
            status: data.status as any,
            notes: data.notes ?? undefined,
            isActive: data.isActive,
        };

        if (data.lastServiceDate) {
            updateData.lastServiceDate = new Date(data.lastServiceDate);
        }

        if (data.nextServiceDate) {
            updateData.nextServiceDate = new Date(data.nextServiceDate);
        }

        return prisma.dialysisStation.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string) {
        return prisma.dialysisStation.delete({
            where: { id },
        });
    }
}

export const dialysisStationService = new DialysisStationService();
