import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const entAudiometryInclude = {
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

export class EntAudiometryService {
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
            sortBy = 'testDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.EntAudiometryWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

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
                { testType: { contains: search } },
            ];
        }

        const [tests, total] = await Promise.all([
            prisma.entAudiometry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: entAudiometryInclude,
            }),
            prisma.entAudiometry.count({ where }),
        ]);

        return { tests, total };
    }

    async findById(id: string) {
        return prisma.entAudiometry.findUnique({
            where: { id },
            include: entAudiometryInclude,
        });
    }

    async create(data: Prisma.EntAudiometryUncheckedCreateInput) {
        return prisma.entAudiometry.create({
            data,
            include: entAudiometryInclude,
        });
    }

    async update(id: string, data: Prisma.EntAudiometryUncheckedUpdateInput) {
        return prisma.entAudiometry.update({
            where: { id },
            data,
            include: entAudiometryInclude,
        });
    }

    async delete(id: string) {
        return prisma.entAudiometry.delete({
            where: { id },
        });
    }
}

export const entAudiometryService = new EntAudiometryService();
