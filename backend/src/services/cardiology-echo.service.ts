import { CardiologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyEchoInclude = {
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

export class CardiologyEchoService {
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

        const where: Prisma.CardiologyEchoWhereInput = {};

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
                { type: { contains: search } },
                { summary: { contains: search } },
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
            ];
        }

        const [echos, total] = await Promise.all([
            prisma.cardiologyEcho.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyEchoInclude,
            }),
            prisma.cardiologyEcho.count({ where }),
        ]);

        return { echos, total };
    }

    async findById(id: string) {
        return prisma.cardiologyEcho.findUnique({
            where: { id },
            include: cardiologyEchoInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt: string;
        type?: string | null;
        lvef?: number;
        lvEndDiastolicDia?: number;
        lvEndSystolicDia?: number;
        rvFunction?: string | null;
        valveFindings?: string | null;
        wallMotion?: string | null;
        pericardialEffusion?: boolean;
        summary?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyEcho.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                type: data.type ?? undefined,
                lvef: data.lvef,
                lvEndDiastolicDia: data.lvEndDiastolicDia,
                lvEndSystolicDia: data.lvEndSystolicDia,
                rvFunction: data.rvFunction ?? undefined,
                valveFindings: data.valveFindings ?? undefined,
                wallMotion: data.wallMotion ?? undefined,
                pericardialEffusion: data.pericardialEffusion,
                summary: data.summary ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyEchoInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt?: string;
        type?: string | null;
        lvef?: number;
        lvEndDiastolicDia?: number;
        lvEndSystolicDia?: number;
        rvFunction?: string | null;
        valveFindings?: string | null;
        wallMotion?: string | null;
        pericardialEffusion?: boolean;
        summary?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyEchoUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            type: data.type ?? undefined,
            lvef: data.lvef,
            lvEndDiastolicDia: data.lvEndDiastolicDia,
            lvEndSystolicDia: data.lvEndSystolicDia,
            rvFunction: data.rvFunction ?? undefined,
            valveFindings: data.valveFindings ?? undefined,
            wallMotion: data.wallMotion ?? undefined,
            pericardialEffusion: data.pericardialEffusion,
            summary: data.summary ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }

        return prisma.cardiologyEcho.update({
            where: { id },
            data: updateData,
            include: cardiologyEchoInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyEcho.delete({
            where: { id },
        });
    }
}

export const cardiologyEchoService = new CardiologyEchoService();
