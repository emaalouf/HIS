import { CardiologyMedicationRoute, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyMedicationInclude = {
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

export class CardiologyMedicationService {
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

        const where: Prisma.CardiologyMedicationOrderWhereInput = {};

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
                { medicationName: { contains: search, mode: 'insensitive' } },
                { indication: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.cardiologyMedicationOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyMedicationInclude,
            }),
            prisma.cardiologyMedicationOrder.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string) {
        return prisma.cardiologyMedicationOrder.findUnique({
            where: { id },
            include: cardiologyMedicationInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        medicationName: string;
        dose?: string | null;
        route?: CardiologyMedicationRoute;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        indication?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyMedicationOrder.create({
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
            include: cardiologyMedicationInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        medicationName?: string;
        dose?: string | null;
        route?: CardiologyMedicationRoute;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        indication?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyMedicationOrderUpdateInput = {
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

        return prisma.cardiologyMedicationOrder.update({
            where: { id },
            data: updateData,
            include: cardiologyMedicationInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyMedicationOrder.delete({
            where: { id },
        });
    }
}

export const cardiologyMedicationService = new CardiologyMedicationService();
