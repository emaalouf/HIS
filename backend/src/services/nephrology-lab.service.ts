import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const nephrologyLabInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
        },
    },
};

export class NephrologyLabService {
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

        const where: Prisma.NephrologyLabResultWhereInput = {};

        if (patientId) where.patientId = patientId;

        if (startDate || endDate) {
            where.collectedAt = {};
            if (startDate) where.collectedAt.gte = new Date(startDate);
            if (endDate) where.collectedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { notes: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.nephrologyLabResult.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: nephrologyLabInclude,
            }),
            prisma.nephrologyLabResult.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.nephrologyLabResult.findUnique({
            where: { id },
            include: nephrologyLabInclude,
        });
    }

    async create(data: {
        patientId: string;
        collectedAt: string;
        creatinine?: number;
        bun?: number;
        egfr?: number;
        potassium?: number;
        sodium?: number;
        chloride?: number;
        bicarbonate?: number;
        calcium?: number;
        phosphorus?: number;
        albumin?: number;
        hemoglobin?: number;
        pth?: number;
        vitaminD?: number;
        uricAcid?: number;
        urineProtein?: number;
        urineAlbumin?: number;
        urineCreatinine?: number;
        uacr?: number;
        upcr?: number;
        notes?: string | null;
    }) {
        return prisma.nephrologyLabResult.create({
            data: {
                patientId: data.patientId,
                collectedAt: new Date(data.collectedAt),
                creatinine: data.creatinine,
                bun: data.bun,
                egfr: data.egfr,
                potassium: data.potassium,
                sodium: data.sodium,
                chloride: data.chloride,
                bicarbonate: data.bicarbonate,
                calcium: data.calcium,
                phosphorus: data.phosphorus,
                albumin: data.albumin,
                hemoglobin: data.hemoglobin,
                pth: data.pth,
                vitaminD: data.vitaminD,
                uricAcid: data.uricAcid,
                urineProtein: data.urineProtein,
                urineAlbumin: data.urineAlbumin,
                urineCreatinine: data.urineCreatinine,
                uacr: data.uacr,
                upcr: data.upcr,
                notes: data.notes ?? undefined,
            },
            include: nephrologyLabInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        collectedAt?: string;
        creatinine?: number;
        bun?: number;
        egfr?: number;
        potassium?: number;
        sodium?: number;
        chloride?: number;
        bicarbonate?: number;
        calcium?: number;
        phosphorus?: number;
        albumin?: number;
        hemoglobin?: number;
        pth?: number;
        vitaminD?: number;
        uricAcid?: number;
        urineProtein?: number;
        urineAlbumin?: number;
        urineCreatinine?: number;
        uacr?: number;
        upcr?: number;
        notes?: string | null;
    }) {
        const updateData: Prisma.NephrologyLabResultUpdateInput = {
            patientId: data.patientId,
            creatinine: data.creatinine,
            bun: data.bun,
            egfr: data.egfr,
            potassium: data.potassium,
            sodium: data.sodium,
            chloride: data.chloride,
            bicarbonate: data.bicarbonate,
            calcium: data.calcium,
            phosphorus: data.phosphorus,
            albumin: data.albumin,
            hemoglobin: data.hemoglobin,
            pth: data.pth,
            vitaminD: data.vitaminD,
            uricAcid: data.uricAcid,
            urineProtein: data.urineProtein,
            urineAlbumin: data.urineAlbumin,
            urineCreatinine: data.urineCreatinine,
            uacr: data.uacr,
            upcr: data.upcr,
            notes: data.notes ?? undefined,
        };

        if (data.collectedAt) {
            updateData.collectedAt = new Date(data.collectedAt);
        }

        return prisma.nephrologyLabResult.update({
            where: { id },
            data: updateData,
            include: nephrologyLabInclude,
        });
    }

    async delete(id: string) {
        return prisma.nephrologyLabResult.delete({
            where: { id },
        });
    }
}

export const nephrologyLabService = new NephrologyLabService();
