import { NephrologyImagingModality, NephrologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const nephrologyImagingInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
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
    visit: {
        select: {
            id: true,
            visitDate: true,
        },
    },
};

export class NephrologyImagingService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: NephrologyTestStatus;
        modality?: NephrologyImagingModality;
        patientId?: string;
        providerId?: string;
        visitId?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            status,
            modality,
            patientId,
            providerId,
            visitId,
            startDate,
            endDate,
            sortBy = 'performedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NephrologyImagingWhereInput = {};

        if (status) where.status = status;
        if (modality) where.modality = modality;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (visitId) where.visitId = visitId;

        if (startDate || endDate) {
            where.performedAt = {};
            if (startDate) where.performedAt.gte = new Date(startDate);
            if (endDate) where.performedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { studyType: { contains: search } },
                { findings: { contains: search } },
                { impression: { contains: search } },
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
            ];
        }

        const [studies, total] = await Promise.all([
            prisma.nephrologyImaging.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: nephrologyImagingInclude,
            }),
            prisma.nephrologyImaging.count({ where }),
        ]);

        return { studies, total };
    }

    async findById(id: string) {
        return prisma.nephrologyImaging.findUnique({
            where: { id },
            include: nephrologyImagingInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: NephrologyTestStatus;
        performedAt: string;
        modality: NephrologyImagingModality;
        studyType?: string | null;
        findings?: string | null;
        impression?: string | null;
        notes?: string | null;
    }) {
        return prisma.nephrologyImaging.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                modality: data.modality,
                studyType: data.studyType ?? undefined,
                findings: data.findings ?? undefined,
                impression: data.impression ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: nephrologyImagingInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: NephrologyTestStatus;
        performedAt?: string;
        modality?: NephrologyImagingModality;
        studyType?: string | null;
        findings?: string | null;
        impression?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NephrologyImagingUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            modality: data.modality,
            studyType: data.studyType ?? undefined,
            findings: data.findings ?? undefined,
            impression: data.impression ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.nephrologyImaging.update({
            where: { id },
            data: updateData,
            include: nephrologyImagingInclude,
        });
    }

    async delete(id: string) {
        return prisma.nephrologyImaging.delete({
            where: { id },
        });
    }
}

export const nephrologyImagingService = new NephrologyImagingService();
