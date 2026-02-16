import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const psychiatryTherapyInclude = {
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

export class PsychiatryTherapyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        therapyType?: string;
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
            therapyType,
            startDate,
            endDate,
            sortBy = 'sessionDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PsychiatryTherapyWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (therapyType) where.therapyType = therapyType as any;

        if (startDate || endDate) {
            where.sessionDate = {};
            if (startDate) where.sessionDate.gte = new Date(startDate);
            if (endDate) where.sessionDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { subjective: { contains: search } },
                { assessment: { contains: search } },
            ];
        }

        const [sessions, total] = await Promise.all([
            prisma.psychiatryTherapy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: psychiatryTherapyInclude,
            }),
            prisma.psychiatryTherapy.count({ where }),
        ]);

        return { sessions, total };
    }

    async findById(id: string) {
        return prisma.psychiatryTherapy.findUnique({
            where: { id },
            include: psychiatryTherapyInclude,
        });
    }

    async create(data: Prisma.PsychiatryTherapyUncheckedCreateInput) {
        return prisma.psychiatryTherapy.create({
            data,
            include: psychiatryTherapyInclude,
        });
    }

    async update(id: string, data: Prisma.PsychiatryTherapyUncheckedUpdateInput) {
        return prisma.psychiatryTherapy.update({
            where: { id },
            data,
            include: psychiatryTherapyInclude,
        });
    }

    async delete(id: string) {
        return prisma.psychiatryTherapy.delete({
            where: { id },
        });
    }
}

export const psychiatryTherapyService = new PsychiatryTherapyService();
