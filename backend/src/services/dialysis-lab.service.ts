import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const dialysisLabInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
        },
    },
};

export class DialysisLabService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
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
            startDate,
            endDate,
            sortBy = 'collectedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisLabResultWhereInput = {};

        if (patientId) where.patientId = patientId;

        if (startDate || endDate) {
            where.collectedAt = {};
            if (startDate) where.collectedAt.gte = new Date(startDate);
            if (endDate) where.collectedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { notes: { contains: search } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.dialysisLabResult.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dialysisLabInclude,
            }),
            prisma.dialysisLabResult.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.dialysisLabResult.findUnique({
            where: { id },
            include: dialysisLabInclude,
        });
    }

    async create(data: {
        patientId: string;
        collectedAt: string;
        ktv?: number;
        urr?: number;
        hemoglobin?: number;
        potassium?: number;
        sodium?: number;
        calcium?: number;
        phosphorus?: number;
        bicarbonate?: number;
        albumin?: number;
        creatinine?: number;
        notes?: string | null;
    }) {
        return prisma.dialysisLabResult.create({
            data: {
                patientId: data.patientId,
                collectedAt: new Date(data.collectedAt),
                ktv: data.ktv,
                urr: data.urr,
                hemoglobin: data.hemoglobin,
                potassium: data.potassium,
                sodium: data.sodium,
                calcium: data.calcium,
                phosphorus: data.phosphorus,
                bicarbonate: data.bicarbonate,
                albumin: data.albumin,
                creatinine: data.creatinine,
                notes: data.notes ?? undefined,
            },
            include: dialysisLabInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        collectedAt?: string;
        ktv?: number;
        urr?: number;
        hemoglobin?: number;
        potassium?: number;
        sodium?: number;
        calcium?: number;
        phosphorus?: number;
        bicarbonate?: number;
        albumin?: number;
        creatinine?: number;
        notes?: string | null;
    }) {
        const updateData: Prisma.DialysisLabResultUncheckedUpdateInput = {
            patientId: data.patientId,
            ktv: data.ktv,
            urr: data.urr,
            hemoglobin: data.hemoglobin,
            potassium: data.potassium,
            sodium: data.sodium,
            calcium: data.calcium,
            phosphorus: data.phosphorus,
            bicarbonate: data.bicarbonate,
            albumin: data.albumin,
            creatinine: data.creatinine,
            notes: data.notes ?? undefined,
        };

        if (data.collectedAt) {
            updateData.collectedAt = new Date(data.collectedAt);
        }

        return prisma.dialysisLabResult.update({
            where: { id },
            data: updateData,
            include: dialysisLabInclude,
        });
    }

    async delete(id: string) {
        return prisma.dialysisLabResult.delete({
            where: { id },
        });
    }
}

export const dialysisLabService = new DialysisLabService();
