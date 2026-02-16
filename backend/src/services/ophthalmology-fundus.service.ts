import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const ophthFundusInclude = {
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

export class OphthalmologyFundusService {
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
            sortBy = 'examDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OphthFundusWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (eyeSide) where.eyeSide = eyeSide as any;

        if (startDate || endDate) {
            where.examDate = {};
            if (startDate) where.examDate.gte = new Date(startDate);
            if (endDate) where.examDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { impression: { contains: search } },
            ];
        }

        const [exams, total] = await Promise.all([
            prisma.ophthFundus.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: ophthFundusInclude,
            }),
            prisma.ophthFundus.count({ where }),
        ]);

        return { exams, total };
    }

    async findById(id: string) {
        return prisma.ophthFundus.findUnique({
            where: { id },
            include: ophthFundusInclude,
        });
    }

    async create(data: Prisma.OphthFundusUncheckedCreateInput) {
        return prisma.ophthFundus.create({
            data,
            include: ophthFundusInclude,
        });
    }

    async update(id: string, data: Prisma.OphthFundusUncheckedUpdateInput) {
        return prisma.ophthFundus.update({
            where: { id },
            data,
            include: ophthFundusInclude,
        });
    }

    async delete(id: string) {
        return prisma.ophthFundus.delete({
            where: { id },
        });
    }
}

export const ophthalmologyFundusService = new OphthalmologyFundusService();
