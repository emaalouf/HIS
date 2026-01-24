import { CardiologyVisitStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyVisitInclude = {
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

export class CardiologyVisitService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: CardiologyVisitStatus;
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
            sortBy = 'visitDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyVisitWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.visitDate = {};
            if (startDate) where.visitDate.gte = new Date(startDate);
            if (endDate) where.visitDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
                { reason: { contains: search, mode: 'insensitive' } },
                { diagnosis: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [visits, total] = await Promise.all([
            prisma.cardiologyVisit.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyVisitInclude,
            }),
            prisma.cardiologyVisit.count({ where }),
        ]);

        return { visits, total };
    }

    async findById(id: string) {
        return prisma.cardiologyVisit.findUnique({
            where: { id },
            include: cardiologyVisitInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        status?: CardiologyVisitStatus;
        visitDate: string;
        reason?: string | null;
        symptoms?: string | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyVisit.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                status: data.status,
                visitDate: new Date(data.visitDate),
                reason: data.reason ?? undefined,
                symptoms: data.symptoms ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                assessment: data.assessment ?? undefined,
                plan: data.plan ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyVisitInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        status?: CardiologyVisitStatus;
        visitDate?: string;
        reason?: string | null;
        symptoms?: string | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyVisitUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            status: data.status,
            reason: data.reason ?? undefined,
            symptoms: data.symptoms ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.visitDate) {
            updateData.visitDate = new Date(data.visitDate);
        }

        return prisma.cardiologyVisit.update({
            where: { id },
            data: updateData,
            include: cardiologyVisitInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyVisit.delete({
            where: { id },
        });
    }
}

export const cardiologyVisitService = new CardiologyVisitService();
