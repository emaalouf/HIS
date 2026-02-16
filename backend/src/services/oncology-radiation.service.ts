import { RadiationStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const radiationInclude = {
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

export class OncologyRadiationService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: RadiationStatus;
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
            sortBy = 'startDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OncologyRadiationWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.startDate = {};
            if (startDate) where.startDate.gte = new Date(startDate);
            if (endDate) where.startDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { cancerType: { contains: search } },
                { treatmentSite: { contains: search } },
            ];
        }

        const [radiations, total] = await Promise.all([
            prisma.oncologyRadiation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: radiationInclude,
            }),
            prisma.oncologyRadiation.count({ where }),
        ]);

        return { radiations, total };
    }

    async findById(id: string) {
        return prisma.oncologyRadiation.findUnique({
            where: { id },
            include: radiationInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        cancerType: string;
        treatmentSite: string;
        totalDoseGy: number;
        fractions: number;
        dosePerFraction: number;
        status?: RadiationStatus;
        startDate: string;
        completionDate?: string | null;
        fractionNumber?: number | null;
        technique?: string | null;
        energy?: string | null;
        simulationDate?: string | null;
        planningCtDate?: string | null;
        skinReactions?: string | null;
        fatigueLevel?: string | null;
        esophagitisGrade?: string | null;
        otherSideEffects?: string | null;
        treatmentBreaks?: number | null;
        breakReason?: string | null;
        notes?: string | null;
    }) {
        return prisma.oncologyRadiation.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                cancerType: data.cancerType,
                treatmentSite: data.treatmentSite,
                totalDoseGy: data.totalDoseGy,
                fractions: data.fractions,
                dosePerFraction: data.dosePerFraction,
                status: data.status,
                startDate: new Date(data.startDate),
                completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
                fractionNumber: data.fractionNumber ?? undefined,
                technique: data.technique ?? undefined,
                energy: data.energy ?? undefined,
                simulationDate: data.simulationDate ? new Date(data.simulationDate) : undefined,
                planningCtDate: data.planningCtDate ? new Date(data.planningCtDate) : undefined,
                skinReactions: data.skinReactions ?? undefined,
                fatigueLevel: data.fatigueLevel ?? undefined,
                esophagitisGrade: data.esophagitisGrade ?? undefined,
                otherSideEffects: data.otherSideEffects ?? undefined,
                treatmentBreaks: data.treatmentBreaks ?? undefined,
                breakReason: data.breakReason ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: radiationInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        cancerType?: string;
        treatmentSite?: string;
        totalDoseGy?: number;
        fractions?: number;
        dosePerFraction?: number;
        status?: RadiationStatus;
        startDate?: string;
        completionDate?: string | null;
        fractionNumber?: number | null;
        technique?: string | null;
        energy?: string | null;
        simulationDate?: string | null;
        planningCtDate?: string | null;
        skinReactions?: string | null;
        fatigueLevel?: string | null;
        esophagitisGrade?: string | null;
        otherSideEffects?: string | null;
        treatmentBreaks?: number | null;
        breakReason?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OncologyRadiationUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            cancerType: data.cancerType,
            treatmentSite: data.treatmentSite,
            totalDoseGy: data.totalDoseGy,
            fractions: data.fractions,
            dosePerFraction: data.dosePerFraction,
            status: data.status,
            fractionNumber: data.fractionNumber ?? undefined,
            technique: data.technique ?? undefined,
            energy: data.energy ?? undefined,
            skinReactions: data.skinReactions ?? undefined,
            fatigueLevel: data.fatigueLevel ?? undefined,
            esophagitisGrade: data.esophagitisGrade ?? undefined,
            otherSideEffects: data.otherSideEffects ?? undefined,
            treatmentBreaks: data.treatmentBreaks ?? undefined,
            breakReason: data.breakReason ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.startDate) {
            updateData.startDate = new Date(data.startDate);
        }
        if (data.completionDate !== undefined) {
            updateData.completionDate = data.completionDate ? new Date(data.completionDate) : null;
        }
        if (data.simulationDate !== undefined) {
            updateData.simulationDate = data.simulationDate ? new Date(data.simulationDate) : null;
        }
        if (data.planningCtDate !== undefined) {
            updateData.planningCtDate = data.planningCtDate ? new Date(data.planningCtDate) : null;
        }

        return prisma.oncologyRadiation.update({
            where: { id },
            data: updateData,
            include: radiationInclude,
        });
    }

    async delete(id: string) {
        return prisma.oncologyRadiation.delete({
            where: { id },
        });
    }
}

export const oncologyRadiationService = new OncologyRadiationService();
