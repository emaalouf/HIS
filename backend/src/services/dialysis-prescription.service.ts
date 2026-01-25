import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const dialysisPrescriptionInclude = {
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

export class DialysisPrescriptionService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        isActive?: boolean;
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
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisPrescriptionWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { dialyzer: { contains: search } },
                { dialysate: { contains: search } },
            ];
        }

        const [prescriptions, total] = await Promise.all([
            prisma.dialysisPrescription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: dialysisPrescriptionInclude,
            }),
            prisma.dialysisPrescription.count({ where }),
        ]);

        return { prescriptions, total };
    }

    async findById(id: string) {
        return prisma.dialysisPrescription.findUnique({
            where: { id },
            include: dialysisPrescriptionInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        dryWeight?: number;
        targetUltrafiltration?: number;
        durationMinutes?: number;
        dialyzer?: string | null;
        dialysate?: string | null;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        accessType?: string | null;
        frequency?: string | null;
        isActive?: boolean;
        notes?: string | null;
        startDate?: string;
        endDate?: string;
    }) {
        return prisma.dialysisPrescription.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                dryWeight: data.dryWeight,
                targetUltrafiltration: data.targetUltrafiltration,
                durationMinutes: data.durationMinutes,
                dialyzer: data.dialyzer ?? undefined,
                dialysate: data.dialysate ?? undefined,
                bloodFlowRate: data.bloodFlowRate,
                dialysateFlowRate: data.dialysateFlowRate,
                accessType: data.accessType ?? undefined,
                frequency: data.frequency ?? undefined,
                isActive: data.isActive,
                notes: data.notes ?? undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
            include: dialysisPrescriptionInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        dryWeight?: number;
        targetUltrafiltration?: number;
        durationMinutes?: number;
        dialyzer?: string | null;
        dialysate?: string | null;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        accessType?: string | null;
        frequency?: string | null;
        isActive?: boolean;
        notes?: string | null;
        startDate?: string;
        endDate?: string;
    }) {
        const updateData: Prisma.DialysisPrescriptionUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            dryWeight: data.dryWeight,
            targetUltrafiltration: data.targetUltrafiltration,
            durationMinutes: data.durationMinutes,
            dialyzer: data.dialyzer ?? undefined,
            dialysate: data.dialysate ?? undefined,
            bloodFlowRate: data.bloodFlowRate,
            dialysateFlowRate: data.dialysateFlowRate,
            accessType: data.accessType ?? undefined,
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

        return prisma.dialysisPrescription.update({
            where: { id },
            data: updateData,
            include: dialysisPrescriptionInclude,
        });
    }

    async delete(id: string) {
        return prisma.dialysisPrescription.delete({
            where: { id },
        });
    }
}

export const dialysisPrescriptionService = new DialysisPrescriptionService();
