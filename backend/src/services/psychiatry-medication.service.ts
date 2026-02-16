import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const psychiatryMedicationInclude = {
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

export class PsychiatryMedicationService {
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
            sortBy = 'assessmentDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PsychiatryMedicationWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

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
                { medicationName: { contains: search } },
                { genericName: { contains: search } },
                { indication: { contains: search } },
            ];
        }

        const [medications, total] = await Promise.all([
            prisma.psychiatryMedication.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: psychiatryMedicationInclude,
            }),
            prisma.psychiatryMedication.count({ where }),
        ]);

        return { medications, total };
    }

    async findById(id: string) {
        return prisma.psychiatryMedication.findUnique({
            where: { id },
            include: psychiatryMedicationInclude,
        });
    }

    async create(data: Prisma.PsychiatryMedicationUncheckedCreateInput) {
        return prisma.psychiatryMedication.create({
            data,
            include: psychiatryMedicationInclude,
        });
    }

    async update(id: string, data: Prisma.PsychiatryMedicationUncheckedUpdateInput) {
        return prisma.psychiatryMedication.update({
            where: { id },
            data,
            include: psychiatryMedicationInclude,
        });
    }

    async delete(id: string) {
        return prisma.psychiatryMedication.delete({
            where: { id },
        });
    }
}

export const psychiatryMedicationService = new PsychiatryMedicationService();
