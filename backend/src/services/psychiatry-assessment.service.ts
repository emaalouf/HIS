import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const psychiatryAssessmentInclude = {
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

export class PsychiatryAssessmentService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        assessmentType?: string;
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
            assessmentType,
            startDate,
            endDate,
            sortBy = 'assessmentDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PsychiatryAssessmentWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (assessmentType) where.assessmentType = assessmentType as any;

        if (startDate || endDate) {
            where.assessmentDate = {};
            if (startDate) where.assessmentDate.gte = new Date(startDate);
            if (endDate) where.assessmentDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { chiefComplaint: { contains: search } },
                { diagnosisPrimary: { contains: search } },
            ];
        }

        const [assessments, total] = await Promise.all([
            prisma.psychiatryAssessment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: psychiatryAssessmentInclude,
            }),
            prisma.psychiatryAssessment.count({ where }),
        ]);

        return { assessments, total };
    }

    async findById(id: string) {
        return prisma.psychiatryAssessment.findUnique({
            where: { id },
            include: psychiatryAssessmentInclude,
        });
    }

    async create(data: Prisma.PsychiatryAssessmentUncheckedCreateInput) {
        return prisma.psychiatryAssessment.create({
            data,
            include: psychiatryAssessmentInclude,
        });
    }

    async update(id: string, data: Prisma.PsychiatryAssessmentUncheckedUpdateInput) {
        return prisma.psychiatryAssessment.update({
            where: { id },
            data,
            include: psychiatryAssessmentInclude,
        });
    }

    async delete(id: string) {
        return prisma.psychiatryAssessment.delete({
            where: { id },
        });
    }
}

export const psychiatryAssessmentService = new PsychiatryAssessmentService();
