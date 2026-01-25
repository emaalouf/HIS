import { NephrologyProcedureStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const nephrologyBiopsyInclude = {
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

export class NephrologyBiopsyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: NephrologyProcedureStatus;
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
            patientId,
            providerId,
            visitId,
            startDate,
            endDate,
            sortBy = 'performedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NephrologyBiopsyWhereInput = {};

        if (status) where.status = status;
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
                { indication: { contains: search } },
                { specimenType: { contains: search } },
                { pathologySummary: { contains: search } },
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
            ];
        }

        const [biopsies, total] = await Promise.all([
            prisma.nephrologyBiopsy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: nephrologyBiopsyInclude,
            }),
            prisma.nephrologyBiopsy.count({ where }),
        ]);

        return { biopsies, total };
    }

    async findById(id: string) {
        return prisma.nephrologyBiopsy.findUnique({
            where: { id },
            include: nephrologyBiopsyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: NephrologyProcedureStatus;
        performedAt: string;
        indication?: string | null;
        specimenType?: string | null;
        pathologySummary?: string | null;
        complications?: string | null;
        notes?: string | null;
    }) {
        return prisma.nephrologyBiopsy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                indication: data.indication ?? undefined,
                specimenType: data.specimenType ?? undefined,
                pathologySummary: data.pathologySummary ?? undefined,
                complications: data.complications ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: nephrologyBiopsyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: NephrologyProcedureStatus;
        performedAt?: string;
        indication?: string | null;
        specimenType?: string | null;
        pathologySummary?: string | null;
        complications?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NephrologyBiopsyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            indication: data.indication ?? undefined,
            specimenType: data.specimenType ?? undefined,
            pathologySummary: data.pathologySummary ?? undefined,
            complications: data.complications ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.nephrologyBiopsy.update({
            where: { id },
            data: updateData,
            include: nephrologyBiopsyInclude,
        });
    }

    async delete(id: string) {
        return prisma.nephrologyBiopsy.delete({
            where: { id },
        });
    }
}

export const nephrologyBiopsyService = new NephrologyBiopsyService();
