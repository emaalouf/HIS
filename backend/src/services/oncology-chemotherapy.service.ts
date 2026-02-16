import { ChemotherapyStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const chemotherapyInclude = {
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

export class OncologyChemotherapyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: ChemotherapyStatus;
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
            sortBy = 'scheduledDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OncologyChemotherapyWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.scheduledDate = {};
            if (startDate) where.scheduledDate.gte = new Date(startDate);
            if (endDate) where.scheduledDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { protocolName: { contains: search } },
                { cancerType: { contains: search } },
            ];
        }

        const [chemotherapies, total] = await Promise.all([
            prisma.oncologyChemotherapy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: chemotherapyInclude,
            }),
            prisma.oncologyChemotherapy.count({ where }),
        ]);

        return { chemotherapies, total };
    }

    async findById(id: string) {
        return prisma.oncologyChemotherapy.findUnique({
            where: { id },
            include: chemotherapyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        protocolName: string;
        cancerType: string;
        cycleNumber: number;
        totalCycles: number;
        status?: ChemotherapyStatus;
        scheduledDate: string;
        administeredDate?: string | null;
        premedications?: string | null;
        chemotherapyAgents?: string | null;
        doses?: string | null;
        route?: string | null;
        durationHours?: number | null;
        tolerance?: string | null;
        sideEffects?: string | null;
        doseModifications?: string | null;
        nextCycleDate?: string | null;
        growthFactorGiven?: boolean | null;
        labsReviewed?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.oncologyChemotherapy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                protocolName: data.protocolName,
                cancerType: data.cancerType,
                cycleNumber: data.cycleNumber,
                totalCycles: data.totalCycles,
                status: data.status,
                scheduledDate: new Date(data.scheduledDate),
                administeredDate: data.administeredDate ? new Date(data.administeredDate) : undefined,
                premedications: data.premedications ?? undefined,
                chemotherapyAgents: data.chemotherapyAgents ?? undefined,
                doses: data.doses ?? undefined,
                route: data.route ?? undefined,
                durationHours: data.durationHours ?? undefined,
                tolerance: data.tolerance ?? undefined,
                sideEffects: data.sideEffects ?? undefined,
                doseModifications: data.doseModifications ?? undefined,
                nextCycleDate: data.nextCycleDate ? new Date(data.nextCycleDate) : undefined,
                growthFactorGiven: data.growthFactorGiven ?? undefined,
                labsReviewed: data.labsReviewed ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: chemotherapyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        protocolName?: string;
        cancerType?: string;
        cycleNumber?: number;
        totalCycles?: number;
        status?: ChemotherapyStatus;
        scheduledDate?: string;
        administeredDate?: string | null;
        premedications?: string | null;
        chemotherapyAgents?: string | null;
        doses?: string | null;
        route?: string | null;
        durationHours?: number | null;
        tolerance?: string | null;
        sideEffects?: string | null;
        doseModifications?: string | null;
        nextCycleDate?: string | null;
        growthFactorGiven?: boolean | null;
        labsReviewed?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OncologyChemotherapyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            protocolName: data.protocolName,
            cancerType: data.cancerType,
            cycleNumber: data.cycleNumber,
            totalCycles: data.totalCycles,
            status: data.status,
            premedications: data.premedications ?? undefined,
            chemotherapyAgents: data.chemotherapyAgents ?? undefined,
            doses: data.doses ?? undefined,
            route: data.route ?? undefined,
            durationHours: data.durationHours ?? undefined,
            tolerance: data.tolerance ?? undefined,
            sideEffects: data.sideEffects ?? undefined,
            doseModifications: data.doseModifications ?? undefined,
            growthFactorGiven: data.growthFactorGiven ?? undefined,
            labsReviewed: data.labsReviewed ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.scheduledDate) {
            updateData.scheduledDate = new Date(data.scheduledDate);
        }
        if (data.administeredDate !== undefined) {
            updateData.administeredDate = data.administeredDate ? new Date(data.administeredDate) : null;
        }
        if (data.nextCycleDate !== undefined) {
            updateData.nextCycleDate = data.nextCycleDate ? new Date(data.nextCycleDate) : null;
        }

        return prisma.oncologyChemotherapy.update({
            where: { id },
            data: updateData,
            include: chemotherapyInclude,
        });
    }

    async delete(id: string) {
        return prisma.oncologyChemotherapy.delete({
            where: { id },
        });
    }
}

export const oncologyChemotherapyService = new OncologyChemotherapyService();
