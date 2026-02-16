import { NeurologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyImagingInclude = {
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

export class NeurologyImagingService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: NeurologyTestStatus;
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
            status,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'performedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologyImagingWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.performedAt = {};
            if (startDate) where.performedAt.gte = new Date(startDate);
            if (endDate) where.performedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { indication: { contains: search } },
                { findings: { contains: search } },
                { impression: { contains: search } },
            ];
        }

        const [imaging, total] = await Promise.all([
            prisma.neurologyImaging.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyImagingInclude,
            }),
            prisma.neurologyImaging.count({ where }),
        ]);

        return { imaging, total };
    }

    async findById(id: string) {
        return prisma.neurologyImaging.findUnique({
            where: { id },
            include: neurologyImagingInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        performedAt: string;
        imagingType: string;
        indication?: string | null;
        findings?: string | null;
        impression?: string | null;
        acuteFindings?: boolean | null;
        strokePresent?: boolean | null;
        hemorrhagePresent?: boolean | null;
        massPresent?: boolean | null;
        contrastUsed?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.neurologyImaging.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                imagingType: data.imagingType,
                indication: data.indication ?? undefined,
                findings: data.findings ?? undefined,
                impression: data.impression ?? undefined,
                acuteFindings: data.acuteFindings ?? undefined,
                strokePresent: data.strokePresent ?? undefined,
                hemorrhagePresent: data.hemorrhagePresent ?? undefined,
                massPresent: data.massPresent ?? undefined,
                contrastUsed: data.contrastUsed ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyImagingInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        performedAt?: string;
        imagingType?: string;
        indication?: string | null;
        findings?: string | null;
        impression?: string | null;
        acuteFindings?: boolean | null;
        strokePresent?: boolean | null;
        hemorrhagePresent?: boolean | null;
        massPresent?: boolean | null;
        contrastUsed?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyImagingUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            visitId: data.visitId ?? undefined,
            status: data.status,
            imagingType: data.imagingType,
            indication: data.indication ?? undefined,
            findings: data.findings ?? undefined,
            impression: data.impression ?? undefined,
            acuteFindings: data.acuteFindings ?? undefined,
            strokePresent: data.strokePresent ?? undefined,
            hemorrhagePresent: data.hemorrhagePresent ?? undefined,
            massPresent: data.massPresent ?? undefined,
            contrastUsed: data.contrastUsed ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.neurologyImaging.update({
            where: { id },
            data: updateData,
            include: neurologyImagingInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyImaging.delete({
            where: { id },
        });
    }
}

export const neurologyImagingService = new NeurologyImagingService();
