import { NeurologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyEegInclude = {
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

export class NeurologyEegService {
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
            sortBy = 'recordedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologyEegWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
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
                { interpretation: { contains: search } },
            ];
        }

        const [eegs, total] = await Promise.all([
            prisma.neurologyEeg.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyEegInclude,
            }),
            prisma.neurologyEeg.count({ where }),
        ]);

        return { eegs, total };
    }

    async findById(id: string) {
        return prisma.neurologyEeg.findUnique({
            where: { id },
            include: neurologyEegInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        recordedAt: string;
        durationMinutes?: number | null;
        indication?: string | null;
        findings?: string | null;
        interpretation?: string | null;
        seizuresDetected?: boolean | null;
        seizureCount?: number | null;
        backgroundActivity?: string | null;
        sleepArchitecture?: string | null;
        photicStimulation?: string | null;
        hyperventilation?: string | null;
        notes?: string | null;
    }) {
        return prisma.neurologyEeg.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                visitId: data.visitId ?? undefined,
                status: data.status,
                recordedAt: new Date(data.recordedAt),
                durationMinutes: data.durationMinutes ?? undefined,
                indication: data.indication ?? undefined,
                findings: data.findings ?? undefined,
                interpretation: data.interpretation ?? undefined,
                seizuresDetected: data.seizuresDetected ?? undefined,
                seizureCount: data.seizureCount ?? undefined,
                backgroundActivity: data.backgroundActivity ?? undefined,
                sleepArchitecture: data.sleepArchitecture ?? undefined,
                photicStimulation: data.photicStimulation ?? undefined,
                hyperventilation: data.hyperventilation ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyEegInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        recordedAt?: string;
        durationMinutes?: number | null;
        indication?: string | null;
        findings?: string | null;
        interpretation?: string | null;
        seizuresDetected?: boolean | null;
        seizureCount?: number | null;
        backgroundActivity?: string | null;
        sleepArchitecture?: string | null;
        photicStimulation?: string | null;
        hyperventilation?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyEegUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            visitId: data.visitId ?? undefined,
            status: data.status,
            durationMinutes: data.durationMinutes ?? undefined,
            indication: data.indication ?? undefined,
            findings: data.findings ?? undefined,
            interpretation: data.interpretation ?? undefined,
            seizuresDetected: data.seizuresDetected ?? undefined,
            seizureCount: data.seizureCount ?? undefined,
            backgroundActivity: data.backgroundActivity ?? undefined,
            sleepArchitecture: data.sleepArchitecture ?? undefined,
            photicStimulation: data.photicStimulation ?? undefined,
            hyperventilation: data.hyperventilation ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.recordedAt) {
            updateData.recordedAt = new Date(data.recordedAt);
        }

        return prisma.neurologyEeg.update({
            where: { id },
            data: updateData,
            include: neurologyEegInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyEeg.delete({
            where: { id },
        });
    }
}

export const neurologyEegService = new NeurologyEegService();
