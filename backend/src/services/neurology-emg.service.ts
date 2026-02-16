import { NeurologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyEmgInclude = {
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

export class NeurologyEmgService {
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

        const where: Prisma.NeurologyEmgWhereInput = {};

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
                { interpretation: { contains: search } },
            ];
        }

        const [emgs, total] = await Promise.all([
            prisma.neurologyEmg.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyEmgInclude,
            }),
            prisma.neurologyEmg.count({ where }),
        ]);

        return { emgs, total };
    }

    async findById(id: string) {
        return prisma.neurologyEmg.findUnique({
            where: { id },
            include: neurologyEmgInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        performedAt: string;
        indication?: string | null;
        musclesTested?: string | null;
        findings?: string | null;
        interpretation?: string | null;
        neuropathyPresent?: boolean | null;
        myopathyPresent?: boolean | null;
        conductionVelocity?: number | null;
        amplitude?: number | null;
        distalLatency?: number | null;
        fWaveLatency?: number | null;
        notes?: string | null;
    }) {
        return prisma.neurologyEmg.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                indication: data.indication ?? undefined,
                musclesTested: data.musclesTested ?? undefined,
                findings: data.findings ?? undefined,
                interpretation: data.interpretation ?? undefined,
                neuropathyPresent: data.neuropathyPresent ?? undefined,
                myopathyPresent: data.myopathyPresent ?? undefined,
                conductionVelocity: data.conductionVelocity ?? undefined,
                amplitude: data.amplitude ?? undefined,
                distalLatency: data.distalLatency ?? undefined,
                fWaveLatency: data.fWaveLatency ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyEmgInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        visitId?: string | null;
        status?: NeurologyTestStatus;
        performedAt?: string;
        indication?: string | null;
        musclesTested?: string | null;
        findings?: string | null;
        interpretation?: string | null;
        neuropathyPresent?: boolean | null;
        myopathyPresent?: boolean | null;
        conductionVelocity?: number | null;
        amplitude?: number | null;
        distalLatency?: number | null;
        fWaveLatency?: number | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyEmgUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            visitId: data.visitId ?? undefined,
            status: data.status,
            indication: data.indication ?? undefined,
            musclesTested: data.musclesTested ?? undefined,
            findings: data.findings ?? undefined,
            interpretation: data.interpretation ?? undefined,
            neuropathyPresent: data.neuropathyPresent ?? undefined,
            myopathyPresent: data.myopathyPresent ?? undefined,
            conductionVelocity: data.conductionVelocity ?? undefined,
            amplitude: data.amplitude ?? undefined,
            distalLatency: data.distalLatency ?? undefined,
            fWaveLatency: data.fWaveLatency ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.neurologyEmg.update({
            where: { id },
            data: updateData,
            include: neurologyEmgInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyEmg.delete({
            where: { id },
        });
    }
}

export const neurologyEmgService = new NeurologyEmgService();
