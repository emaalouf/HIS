import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const entNasalEndoscopyInclude = {
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

export class EntNasalEndoscopyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
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
            startDate,
            endDate,
            sortBy = 'procedureDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.EntNasalEndoscopyWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.procedureDate = {};
            if (startDate) where.procedureDate.gte = new Date(startDate);
            if (endDate) where.procedureDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { indication: { contains: search } },
                { impression: { contains: search } },
            ];
        }

        const [procedures, total] = await Promise.all([
            prisma.entNasalEndoscopy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: entNasalEndoscopyInclude,
            }),
            prisma.entNasalEndoscopy.count({ where }),
        ]);

        return { procedures, total };
    }

    async findById(id: string) {
        return prisma.entNasalEndoscopy.findUnique({
            where: { id },
            include: entNasalEndoscopyInclude,
        });
    }

    async create(data: Prisma.EntNasalEndoscopyUncheckedCreateInput) {
        return prisma.entNasalEndoscopy.create({
            data,
            include: entNasalEndoscopyInclude,
        });
    }

    async update(id: string, data: Prisma.EntNasalEndoscopyUncheckedUpdateInput) {
        return prisma.entNasalEndoscopy.update({
            where: { id },
            data,
            include: entNasalEndoscopyInclude,
        });
    }

    async delete(id: string) {
        return prisma.entNasalEndoscopy.delete({
            where: { id },
        });
    }
}

export const entNasalEndoscopyService = new EntNasalEndoscopyService();
