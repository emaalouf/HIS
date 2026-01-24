import { CardiologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyStressTestInclude = {
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

export class CardiologyStressTestService {
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
            sortBy = 'performedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyStressTestWhereInput = {};

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
                { type: { contains: search, mode: 'insensitive' } },
                { protocol: { contains: search, mode: 'insensitive' } },
                { result: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [stressTests, total] = await Promise.all([
            prisma.cardiologyStressTest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyStressTestInclude,
            }),
            prisma.cardiologyStressTest.count({ where }),
        ]);

        return { stressTests, total };
    }

    async findById(id: string) {
        return prisma.cardiologyStressTest.findUnique({
            where: { id },
            include: cardiologyStressTestInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt: string;
        type?: string | null;
        protocol?: string | null;
        durationMinutes?: number;
        mets?: number;
        maxHeartRate?: number;
        maxBpSystolic?: number;
        maxBpDiastolic?: number;
        symptoms?: string | null;
        result?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyStressTest.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                type: data.type ?? undefined,
                protocol: data.protocol ?? undefined,
                durationMinutes: data.durationMinutes,
                mets: data.mets,
                maxHeartRate: data.maxHeartRate,
                maxBpSystolic: data.maxBpSystolic,
                maxBpDiastolic: data.maxBpDiastolic,
                symptoms: data.symptoms ?? undefined,
                result: data.result ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyStressTestInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt?: string;
        type?: string | null;
        protocol?: string | null;
        durationMinutes?: number;
        mets?: number;
        maxHeartRate?: number;
        maxBpSystolic?: number;
        maxBpDiastolic?: number;
        symptoms?: string | null;
        result?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyStressTestUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            type: data.type ?? undefined,
            protocol: data.protocol ?? undefined,
            durationMinutes: data.durationMinutes,
            mets: data.mets,
            maxHeartRate: data.maxHeartRate,
            maxBpSystolic: data.maxBpSystolic,
            maxBpDiastolic: data.maxBpDiastolic,
            symptoms: data.symptoms ?? undefined,
            result: data.result ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.cardiologyStressTest.update({
            where: { id },
            data: updateData,
            include: cardiologyStressTestInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyStressTest.delete({
            where: { id },
        });
    }
}

export const cardiologyStressTestService = new CardiologyStressTestService();
