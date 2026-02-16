import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const dermBiopsyInclude = {
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
    lesion: {
        select: {
            id: true,
            location: true,
            lesionType: true,
        },
    },
};

export class DermatologyBiopsyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        biopsyType?: string;
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
            biopsyType,
            startDate,
            endDate,
            sortBy = 'biopsyDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DermBiopsyWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (biopsyType) where.biopsyType = biopsyType as any;

        if (startDate || endDate) {
            where.biopsyDate = {};
            if (startDate) where.biopsyDate.gte = new Date(startDate);
            if (endDate) where.biopsyDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { location: { contains: search } },
                { pathologicDiagnosis: { contains: search } },
            ];
        }

        const [biopsies, total] = await Promise.all([
            prisma.dermBiopsy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dermBiopsyInclude,
            }),
            prisma.dermBiopsy.count({ where }),
        ]);

        return { biopsies, total };
    }

    async findById(id: string) {
        return prisma.dermBiopsy.findUnique({
            where: { id },
            include: dermBiopsyInclude,
        });
    }

    async create(data: Prisma.DermBiopsyUncheckedCreateInput) {
        return prisma.dermBiopsy.create({
            data,
            include: dermBiopsyInclude,
        });
    }

    async update(id: string, data: Prisma.DermBiopsyUncheckedUpdateInput) {
        return prisma.dermBiopsy.update({
            where: { id },
            data,
            include: dermBiopsyInclude,
        });
    }

    async delete(id: string) {
        return prisma.dermBiopsy.delete({
            where: { id },
        });
    }
}

export const dermatologyBiopsyService = new DermatologyBiopsyService();
