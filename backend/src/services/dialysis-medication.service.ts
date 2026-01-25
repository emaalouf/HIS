import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const dialysisMedicationInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
        },
    },
};

export class DialysisMedicationService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
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
            isActive,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisMedicationOrderWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (isActive !== undefined) where.isActive = isActive;

        if (startDate || endDate) {
            where.startDate = {};
            if (startDate) where.startDate.gte = new Date(startDate);
            if (endDate) where.startDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { medicationName: { contains: search } },
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.dialysisMedicationOrder.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dialysisMedicationInclude,
            }),
            prisma.dialysisMedicationOrder.count({ where }),
        ]);

        return { orders, total };
    }

    async findById(id: string) {
        return prisma.dialysisMedicationOrder.findUnique({
            where: { id },
            include: dialysisMedicationInclude,
        });
    }

    async create(data: {
        patientId: string;
        medicationName: string;
        dose?: string | null;
        route?: string;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        notes?: string | null;
    }) {
        return prisma.dialysisMedicationOrder.create({
            data: {
                patientId: data.patientId,
                medicationName: data.medicationName,
                dose: data.dose ?? undefined,
                route: data.route as any,
                frequency: data.frequency ?? undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                lastAdministeredAt: data.lastAdministeredAt ? new Date(data.lastAdministeredAt) : undefined,
                isActive: data.isActive,
                notes: data.notes ?? undefined,
            },
            include: dialysisMedicationInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        medicationName?: string;
        dose?: string | null;
        route?: string;
        frequency?: string | null;
        startDate?: string;
        endDate?: string;
        lastAdministeredAt?: string;
        isActive?: boolean;
        notes?: string | null;
    }) {
        const updateData: Prisma.DialysisMedicationOrderUncheckedUpdateInput = {
            patientId: data.patientId,
            medicationName: data.medicationName,
            dose: data.dose ?? undefined,
            route: data.route as any,
            frequency: data.frequency ?? undefined,
            isActive: data.isActive,
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

        return prisma.dialysisMedicationOrder.update({
            where: { id },
            data: updateData,
            include: dialysisMedicationInclude,
        });
    }

    async delete(id: string) {
        return prisma.dialysisMedicationOrder.delete({
            where: { id },
        });
    }
}

export const dialysisMedicationService = new DialysisMedicationService();
