import { CardiologyProcedureStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyProcedureInclude = {
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

export class CardiologyProcedureService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: CardiologyProcedureStatus;
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
            sortBy = 'procedureDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyProcedureWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (visitId) where.visitId = visitId;

        if (startDate || endDate) {
            where.procedureDate = {};
            if (startDate) where.procedureDate.gte = new Date(startDate);
            if (endDate) where.procedureDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { type: { contains: search, mode: 'insensitive' } },
                { indication: { contains: search, mode: 'insensitive' } },
                { findings: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [procedures, total] = await Promise.all([
            prisma.cardiologyProcedure.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyProcedureInclude,
            }),
            prisma.cardiologyProcedure.count({ where }),
        ]);

        return { procedures, total };
    }

    async findById(id: string) {
        return prisma.cardiologyProcedure.findUnique({
            where: { id },
            include: cardiologyProcedureInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyProcedureStatus;
        procedureDate: string;
        type?: string | null;
        indication?: string | null;
        findings?: string | null;
        complications?: string | null;
        outcome?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyProcedure.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                procedureDate: new Date(data.procedureDate),
                type: data.type ?? undefined,
                indication: data.indication ?? undefined,
                findings: data.findings ?? undefined,
                complications: data.complications ?? undefined,
                outcome: data.outcome ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyProcedureInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyProcedureStatus;
        procedureDate?: string;
        type?: string | null;
        indication?: string | null;
        findings?: string | null;
        complications?: string | null;
        outcome?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyProcedureUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            type: data.type ?? undefined,
            indication: data.indication ?? undefined,
            findings: data.findings ?? undefined,
            complications: data.complications ?? undefined,
            outcome: data.outcome ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.procedureDate) {
            updateData.procedureDate = new Date(data.procedureDate);
        }

        return prisma.cardiologyProcedure.update({
            where: { id },
            data: updateData,
            include: cardiologyProcedureInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyProcedure.delete({
            where: { id },
        });
    }
}

export const cardiologyProcedureService = new CardiologyProcedureService();
