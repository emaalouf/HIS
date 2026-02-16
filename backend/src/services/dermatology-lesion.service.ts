import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const dermLesionInclude = {
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

export class DermatologyLesionService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        lesionType?: string;
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
            lesionType,
            startDate,
            endDate,
            sortBy = 'dateNoted',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DermLesionWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (lesionType) where.lesionType = lesionType as any;

        if (startDate || endDate) {
            where.dateNoted = {};
            if (startDate) where.dateNoted.gte = new Date(startDate);
            if (endDate) where.dateNoted.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { location: { contains: search } },
                { diagnosisClinical: { contains: search } },
            ];
        }

        const [lesions, total] = await Promise.all([
            prisma.dermLesion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dermLesionInclude,
            }),
            prisma.dermLesion.count({ where }),
        ]);

        return { lesions, total };
    }

    async findById(id: string) {
        return prisma.dermLesion.findUnique({
            where: { id },
            include: dermLesionInclude,
        });
    }

    async create(data: Prisma.DermLesionUncheckedCreateInput) {
        return prisma.dermLesion.create({
            data,
            include: dermLesionInclude,
        });
    }

    async update(id: string, data: Prisma.DermLesionUncheckedUpdateInput) {
        return prisma.dermLesion.update({
            where: { id },
            data,
            include: dermLesionInclude,
        });
    }

    async delete(id: string) {
        return prisma.dermLesion.delete({
            where: { id },
        });
    }
}

export const dermatologyLesionService = new DermatologyLesionService();
