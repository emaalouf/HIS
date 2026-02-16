import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const ophthVisualAcuityInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
    provider: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    },
};

export class OphthalmologyVisualAcuityService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        eyeSide?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            patientId,
            providerId,
            eyeSide,
            startDate,
            endDate,
            sortBy = 'testDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OphthVisualAcuityWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (eyeSide) where.eyeSide = eyeSide as any;

        if (startDate || endDate) {
            where.testDate = {};
            if (startDate) where.testDate.gte = new Date(startDate);
            if (endDate) where.testDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { diagnosis: { contains: search } },
            ];
        }

        const [tests, total] = await Promise.all([
            prisma.ophthVisualAcuity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: ophthVisualAcuityInclude,
            }),
            prisma.ophthVisualAcuity.count({ where }),
        ]);

        return { tests, total };
    }

    async findById(id: string) {
        return prisma.ophthVisualAcuity.findUnique({
            where: { id },
            include: ophthVisualAcuityInclude,
        });
    }

    async create(data: Prisma.OphthVisualAcuityUncheckedCreateInput) {
        return prisma.ophthVisualAcuity.create({
            data,
            include: ophthVisualAcuityInclude,
        });
    }

    async update(id: string, data: Prisma.OphthVisualAcuityUncheckedUpdateInput) {
        return prisma.ophthVisualAcuity.update({
            where: { id },
            data,
            include: ophthVisualAcuityInclude,
        });
    }

    async delete(id: string) {
        return prisma.ophthVisualAcuity.delete({
            where: { id },
        });
    }
}

export const ophthalmologyVisualAcuityService = new OphthalmologyVisualAcuityService();
