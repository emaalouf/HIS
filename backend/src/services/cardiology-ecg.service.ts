import { CardiologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyEcgInclude = {
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

export class CardiologyEcgService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: CardiologyTestStatus;
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
            sortBy = 'recordedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyEcgWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (visitId) where.visitId = visitId;

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { type: { contains: search, mode: 'insensitive' } },
                { rhythm: { contains: search, mode: 'insensitive' } },
                { interpretation: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [ecgs, total] = await Promise.all([
            prisma.cardiologyEcg.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyEcgInclude,
            }),
            prisma.cardiologyEcg.count({ where }),
        ]);

        return { ecgs, total };
    }

    async findById(id: string) {
        return prisma.cardiologyEcg.findUnique({
            where: { id },
            include: cardiologyEcgInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        recordedAt: string;
        type?: string | null;
        rhythm?: string | null;
        heartRate?: number;
        prInterval?: number;
        qrsDuration?: number;
        qtInterval?: number;
        qtc?: number;
        interpretation?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyEcg.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                recordedAt: new Date(data.recordedAt),
                type: data.type ?? undefined,
                rhythm: data.rhythm ?? undefined,
                heartRate: data.heartRate,
                prInterval: data.prInterval,
                qrsDuration: data.qrsDuration,
                qtInterval: data.qtInterval,
                qtc: data.qtc,
                interpretation: data.interpretation ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyEcgInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        recordedAt?: string;
        type?: string | null;
        rhythm?: string | null;
        heartRate?: number;
        prInterval?: number;
        qrsDuration?: number;
        qtInterval?: number;
        qtc?: number;
        interpretation?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyEcgUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            type: data.type ?? undefined,
            rhythm: data.rhythm ?? undefined,
            heartRate: data.heartRate,
            prInterval: data.prInterval,
            qrsDuration: data.qrsDuration,
            qtInterval: data.qtInterval,
            qtc: data.qtc,
            interpretation: data.interpretation ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.recordedAt) {
            updateData.recordedAt = new Date(data.recordedAt);
        }

        return prisma.cardiologyEcg.update({
            where: { id },
            data: updateData,
            include: cardiologyEcgInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyEcg.delete({
            where: { id },
        });
    }
}

export const cardiologyEcgService = new CardiologyEcgService();
