import { NephrologyMedicationRoute, Prisma } from '@prisma/client';
import prisma from '../config/database';

const nephrologyMedicationInclude = {
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
};

export class NephrologyMedicationService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
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
            isActive,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NephrologyMedicationOrderWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (isActive !== undefined) where.isActive = isActive;

        if (startDate || endDate) {
            where.startDate = {};
            if (startDate) where.startDate.gte = new Date(startDate);
            if (endDate) where.startDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { medicationName: { contains: search } },
                { indication: { contains: search } },
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.nephrologyMedicationOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: nephrologyMedicationInclude,
            }),
            prisma.nephrologyMedicationOrder.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string) {
        return prisma.nephrologyMedicationOrder.findUnique({
            where: { id },
            include: nephrologyMedicationInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        medicationName: string;
        dose?: string | null;
        route?: NephrologyMedicationRoute;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        indication?: string | null;
        notes?: string | null;
    }) {
        return prisma.nephrologyMedicationOrder.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                medicationName: data.medicationName,
                dose: data.dose ?? undefined,
                route: data.route,
                frequency: data.frequency ?? undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                lastAdministeredAt: data.lastAdministeredAt ? new Date(data.lastAdministeredAt) : undefined,
                isActive: data.isActive,
                indication: data.indication ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: nephrologyMedicationInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        medicationName?: string;
        dose?: string | null;
        route?: NephrologyMedicationRoute;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        indication?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NephrologyMedicationOrderUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            medicationName: data.medicationName,
            dose: data.dose ?? undefined,
            route: data.route,
            frequency: data.frequency ?? undefined,
            isActive: data.isActive,
            indication: data.indication ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.startDate) {
            updateData.startDate = new Date(data.startDate);
        }

        if (data.endDate) {
            updateData.endDate = new Date(data.endDate);
        }

        if (data.lastAdministeredAt) {
            updateData.lastAdministeredAt = new Date(data.lastAdministeredAt);
        }

        return prisma.nephrologyMedicationOrder.update({
            where: { id },
            data: updateData,
            include: nephrologyMedicationInclude,
        });
    }

    async delete(id: string) {
        return prisma.nephrologyMedicationOrder.delete({
            where: { id },
        });
    }
}

export const nephrologyMedicationService = new NephrologyMedicationService();
