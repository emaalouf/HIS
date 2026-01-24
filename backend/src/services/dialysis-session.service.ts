import { DialysisStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const dialysisSessionInclude = {
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

export class DialysisSessionService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: DialysisStatus;
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
            sortBy = 'startTime',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisSessionWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate);
            if (endDate) where.startTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { patient: { phone: { contains: search } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [sessions, total] = await Promise.all([
            prisma.dialysisSession.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dialysisSessionInclude,
            }),
            prisma.dialysisSession.count({ where }),
        ]);

        return { sessions, total };
    }

    async findById(id: string) {
        return prisma.dialysisSession.findUnique({
            where: { id },
            include: dialysisSessionInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        status?: DialysisStatus;
        startTime: string;
        endTime: string;
        machineNumber?: string | null;
        accessType?: string | null;
        dialyzer?: string | null;
        dialysate?: string | null;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        ultrafiltrationVolume?: number;
        weightPre?: number;
        weightPost?: number;
        notes?: string | null;
    }) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (end <= start) {
            throw new Error('End time must be after start time');
        }

        return prisma.dialysisSession.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                status: data.status,
                startTime: start,
                endTime: end,
                machineNumber: data.machineNumber ?? undefined,
                accessType: data.accessType ?? undefined,
                dialyzer: data.dialyzer ?? undefined,
                dialysate: data.dialysate ?? undefined,
                bloodFlowRate: data.bloodFlowRate,
                dialysateFlowRate: data.dialysateFlowRate,
                ultrafiltrationVolume: data.ultrafiltrationVolume,
                weightPre: data.weightPre,
                weightPost: data.weightPost,
                notes: data.notes ?? undefined,
            },
            include: dialysisSessionInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        status?: DialysisStatus;
        startTime?: string;
        endTime?: string;
        machineNumber?: string | null;
        accessType?: string | null;
        dialyzer?: string | null;
        dialysate?: string | null;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        ultrafiltrationVolume?: number;
        weightPre?: number;
        weightPost?: number;
        notes?: string | null;
    }) {
        const updateData: Prisma.DialysisSessionUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            status: data.status,
            machineNumber: data.machineNumber ?? undefined,
            accessType: data.accessType ?? undefined,
            dialyzer: data.dialyzer ?? undefined,
            dialysate: data.dialysate ?? undefined,
            bloodFlowRate: data.bloodFlowRate,
            dialysateFlowRate: data.dialysateFlowRate,
            ultrafiltrationVolume: data.ultrafiltrationVolume,
            weightPre: data.weightPre,
            weightPost: data.weightPost,
            notes: data.notes ?? undefined,
        };

        if (data.startTime) {
            updateData.startTime = new Date(data.startTime);
        }

        if (data.endTime) {
            updateData.endTime = new Date(data.endTime);
        }

        if (data.startTime && data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
            throw new Error('End time must be after start time');
        }

        return prisma.dialysisSession.update({
            where: { id },
            data: updateData,
            include: dialysisSessionInclude,
        });
    }

    async delete(id: string) {
        return prisma.dialysisSession.delete({
            where: { id },
        });
    }
}

export const dialysisSessionService = new DialysisSessionService();
