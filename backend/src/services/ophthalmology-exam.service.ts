import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const ophthExamInclude = {
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

export class OphthalmologyExamService {
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
            sortBy = 'examDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OphthExamWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

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
                { chiefComplaint: { contains: search } },
                { diagnosis: { contains: search } },
            ];
        }

        const [exams, total] = await Promise.all([
            prisma.ophthExam.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: ophthExamInclude,
            }),
            prisma.ophthExam.count({ where }),
        ]);

        return { exams, total };
    }

    async findById(id: string) {
        return prisma.ophthExam.findUnique({
            where: { id },
            include: ophthExamInclude,
        });
    }

    async create(data: Prisma.OphthExamUncheckedCreateInput) {
        return prisma.ophthExam.create({
            data,
            include: ophthExamInclude,
        });
    }

    async update(id: string, data: Prisma.OphthExamUncheckedUpdateInput) {
        return prisma.ophthExam.update({
            where: { id },
            data,
            include: ophthExamInclude,
        });
    }

    async delete(id: string) {
        return prisma.ophthExam.delete({
            where: { id },
        });
    }
}

export const ophthalmologyExamService = new OphthalmologyExamService();
