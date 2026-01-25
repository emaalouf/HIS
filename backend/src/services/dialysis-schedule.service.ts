import { DialysisScheduleRecurrence, Prisma } from '@prisma/client';
import prisma from '../config/database';

const dialysisScheduleInclude = {
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
    station: {
        select: {
            id: true,
            name: true,
            room: true,
        },
    },
};

export class DialysisScheduleService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        stationId?: string;
        recurrence?: DialysisScheduleRecurrence;
        isActive?: boolean;
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
            providerId,
            stationId,
            recurrence,
            isActive,
            startDate,
            endDate,
            sortBy = 'startTime',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisScheduleWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (stationId) where.stationId = stationId;
        if (recurrence) where.recurrence = recurrence;
        if (isActive !== undefined) where.isActive = isActive;

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate);
            if (endDate) where.startTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
            ];
        }

        const [schedules, total] = await Promise.all([
            prisma.dialysisSchedule.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dialysisScheduleInclude,
            }),
            prisma.dialysisSchedule.count({ where }),
        ]);

        return { schedules, total };
    }

    async findById(id: string) {
        return prisma.dialysisSchedule.findUnique({
            where: { id },
            include: dialysisScheduleInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        stationId?: string | null;
        startTime: string;
        durationMinutes: number;
        recurrence?: DialysisScheduleRecurrence;
        daysOfWeek?: string[];
        endDate?: string;
        isActive?: boolean;
        notes?: string | null;
    }) {
        return prisma.dialysisSchedule.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                stationId: data.stationId ?? undefined,
                startTime: new Date(data.startTime),
                durationMinutes: data.durationMinutes,
                recurrence: data.recurrence,
                daysOfWeek: data.daysOfWeek ?? [],
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                isActive: data.isActive,
                notes: data.notes ?? undefined,
            },
            include: dialysisScheduleInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        stationId?: string | null;
        startTime?: string;
        durationMinutes?: number;
        recurrence?: DialysisScheduleRecurrence;
        daysOfWeek?: string[];
        endDate?: string;
        isActive?: boolean;
        notes?: string | null;
    }) {
        const updateData: Prisma.DialysisScheduleUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            stationId: data.stationId ?? undefined,
            durationMinutes: data.durationMinutes,
            recurrence: data.recurrence,
            daysOfWeek: data.daysOfWeek ?? undefined,
            isActive: data.isActive,
            notes: data.notes ?? undefined,
        };

        if (data.startTime) {
            updateData.startTime = new Date(data.startTime);
        }

        if (data.endDate) {
            updateData.endDate = new Date(data.endDate);
        }

        return prisma.dialysisSchedule.update({
            where: { id },
            data: updateData,
            include: dialysisScheduleInclude,
        });
    }

    async delete(id: string) {
        return prisma.dialysisSchedule.delete({
            where: { id },
        });
    }
}

export const dialysisScheduleService = new DialysisScheduleService();
