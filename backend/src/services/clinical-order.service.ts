import { OrderPriority, OrderStatus, OrderType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const clinicalOrderInclude = {
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
            startTime: true,
            status: true,
        },
    },
};

export class ClinicalOrderService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: OrderStatus;
        orderType?: OrderType;
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
            orderType,
            patientId,
            providerId,
            encounterId,
            startDate,
            endDate,
            sortBy = 'orderedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ClinicalOrderWhereInput = {};

        if (status) where.status = status;
        if (orderType) where.orderType = orderType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (encounterId) where.encounterId = encounterId;

        if (startDate || endDate) {
            where.orderedAt = {};
            if (startDate) where.orderedAt.gte = new Date(startDate);
            if (endDate) where.orderedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { orderName: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.clinicalOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: clinicalOrderInclude,
            }),
            prisma.clinicalOrder.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string) {
        return prisma.clinicalOrder.findUnique({
            where: { id },
            include: {
                ...clinicalOrderInclude,
                results: true,
            },
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        encounterId?: string | null;
        orderType: OrderType;
        status?: OrderStatus;
        priority?: OrderPriority | null;
        orderedAt?: string | null;
        orderName: string;
        description?: string | null;
        notes?: string | null;
    }) {
        return prisma.clinicalOrder.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                encounterId: data.encounterId || undefined,
                orderType: data.orderType,
                status: data.status,
                priority: data.priority ?? undefined,
                orderedAt: data.orderedAt ? new Date(data.orderedAt) : undefined,
                orderName: data.orderName,
                description: data.description ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: clinicalOrderInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        encounterId?: string | null;
        orderType?: OrderType;
        status?: OrderStatus;
        priority?: OrderPriority | null;
        orderedAt?: string | null;
        orderName?: string;
        description?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.ClinicalOrderUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            encounterId: data.encounterId || undefined,
            orderType: data.orderType,
            status: data.status,
            priority: data.priority ?? undefined,
            orderName: data.orderName,
            description: data.description ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.orderedAt) {
            updateData.orderedAt = new Date(data.orderedAt);
        }

        return prisma.clinicalOrder.update({
            where: { id },
            data: updateData,
            include: clinicalOrderInclude,
        });
    }

    async delete(id: string) {
        return prisma.clinicalOrder.delete({
            where: { id },
        });
    }
}

export const clinicalOrderService = new ClinicalOrderService();
