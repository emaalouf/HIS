import { MedicationOrderStatus, MedicationRoute, Prisma } from '@prisma/client';
import prisma from '../config/database';

const medicationOrderInclude = {
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
    encounter: {
        select: {
            id: true,
            status: true,
            startTime: true,
        },
    },
};

export class MedicationOrderService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: MedicationOrderStatus;
        patientId?: string;
        providerId?: string;
        encounterId?: string;
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
            encounterId,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.MedicationOrderWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (encounterId) where.encounterId = encounterId;

        if (startDate || endDate) {
            where.startDate = {};
            if (startDate) where.startDate.gte = new Date(startDate);
            if (endDate) where.startDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
                { medicationName: { contains: search, mode: 'insensitive' } },
                { indication: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.medicationOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: medicationOrderInclude,
            }),
            prisma.medicationOrder.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string) {
        return prisma.medicationOrder.findUnique({
            where: { id },
            include: {
                ...medicationOrderInclude,
                administrations: true,
            },
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        encounterId?: string | null;
        status?: MedicationOrderStatus;
        medicationName: string;
        dose?: string | null;
        route?: MedicationRoute | null;
        frequency?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        lastAdministeredAt?: string | null;
        indication?: string | null;
        notes?: string | null;
    }) {
        return prisma.medicationOrder.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId || undefined,
                encounterId: data.encounterId || undefined,
                status: data.status,
                medicationName: data.medicationName,
                dose: data.dose ?? undefined,
                route: data.route ?? undefined,
                frequency: data.frequency ?? undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                lastAdministeredAt: data.lastAdministeredAt ? new Date(data.lastAdministeredAt) : undefined,
                indication: data.indication ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: medicationOrderInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        encounterId?: string | null;
        status?: MedicationOrderStatus;
        medicationName?: string;
        dose?: string | null;
        route?: MedicationRoute | null;
        frequency?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        lastAdministeredAt?: string | null;
        indication?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.MedicationOrderUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            encounterId: data.encounterId ?? undefined,
            status: data.status,
            medicationName: data.medicationName,
            dose: data.dose ?? undefined,
            route: data.route ?? undefined,
            frequency: data.frequency ?? undefined,
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

        return prisma.medicationOrder.update({
            where: { id },
            data: updateData,
            include: medicationOrderInclude,
        });
    }

    async delete(id: string) {
        return prisma.medicationOrder.delete({
            where: { id },
        });
    }
}

export const medicationOrderService = new MedicationOrderService();
