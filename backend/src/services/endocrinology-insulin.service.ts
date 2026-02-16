import { InsulinType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const insulinInclude = {
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

export class EndocrinologyInsulinService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        insulinType?: InsulinType;
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
            insulinType,
            patientId,
            providerId,
            isActive,
            startDate,
            endDate,
            sortBy = 'prescriptionDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.EndoInsulinWhereInput = {};

        if (insulinType) where.insulinType = insulinType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (isActive !== undefined) where.isActive = isActive;

        if (startDate || endDate) {
            where.prescriptionDate = {};
            if (startDate) where.prescriptionDate.gte = new Date(startDate);
            if (endDate) where.prescriptionDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { brandName: { contains: search } },
                { sideEffects: { contains: search } },
            ];
        }

        const [prescriptions, total] = await Promise.all([
            prisma.endoInsulin.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: insulinInclude,
            }),
            prisma.endoInsulin.count({ where }),
        ]);

        return { prescriptions, total };
    }

    async findById(id: string) {
        return prisma.endoInsulin.findUnique({
            where: { id },
            include: insulinInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        prescriptionDate: string;
        insulinType: InsulinType;
        brandName?: string | null;
        morningDose?: number | null;
        noonDose?: number | null;
        eveningDose?: number | null;
        bedtimeDose?: number | null;
        correctionFactor?: number | null;
        carbRatio?: number | null;
        basalRate?: number | null;
        siteRotation?: string | null;
        storageInstructions?: string | null;
        hypoglycemiaAwareness?: boolean;
        glucagonAvailable?: boolean;
        lastHbA1c?: number | null;
        adjustmentsMade?: string | null;
        sideEffects?: string | null;
        adherence?: string | null;
        isActive?: boolean;
        notes?: string | null;
    }) {
        return prisma.endoInsulin.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                prescriptionDate: new Date(data.prescriptionDate),
                insulinType: data.insulinType,
                brandName: data.brandName ?? undefined,
                morningDose: data.morningDose ?? undefined,
                noonDose: data.noonDose ?? undefined,
                eveningDose: data.eveningDose ?? undefined,
                bedtimeDose: data.bedtimeDose ?? undefined,
                correctionFactor: data.correctionFactor ?? undefined,
                carbRatio: data.carbRatio ?? undefined,
                basalRate: data.basalRate ?? undefined,
                siteRotation: data.siteRotation ?? undefined,
                storageInstructions: data.storageInstructions ?? undefined,
                hypoglycemiaAwareness: data.hypoglycemiaAwareness,
                glucagonAvailable: data.glucagonAvailable,
                lastHbA1c: data.lastHbA1c ?? undefined,
                adjustmentsMade: data.adjustmentsMade ?? undefined,
                sideEffects: data.sideEffects ?? undefined,
                adherence: data.adherence ?? undefined,
                isActive: data.isActive,
                notes: data.notes ?? undefined,
            },
            include: insulinInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        prescriptionDate?: string;
        insulinType?: InsulinType;
        brandName?: string | null;
        morningDose?: number | null;
        noonDose?: number | null;
        eveningDose?: number | null;
        bedtimeDose?: number | null;
        correctionFactor?: number | null;
        carbRatio?: number | null;
        basalRate?: number | null;
        siteRotation?: string | null;
        storageInstructions?: string | null;
        hypoglycemiaAwareness?: boolean;
        glucagonAvailable?: boolean;
        lastHbA1c?: number | null;
        adjustmentsMade?: string | null;
        sideEffects?: string | null;
        adherence?: string | null;
        isActive?: boolean;
        notes?: string | null;
    }) {
        const updateData: Prisma.EndoInsulinUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            insulinType: data.insulinType,
            brandName: data.brandName ?? undefined,
            morningDose: data.morningDose ?? undefined,
            noonDose: data.noonDose ?? undefined,
            eveningDose: data.eveningDose ?? undefined,
            bedtimeDose: data.bedtimeDose ?? undefined,
            correctionFactor: data.correctionFactor ?? undefined,
            carbRatio: data.carbRatio ?? undefined,
            basalRate: data.basalRate ?? undefined,
            siteRotation: data.siteRotation ?? undefined,
            storageInstructions: data.storageInstructions ?? undefined,
            hypoglycemiaAwareness: data.hypoglycemiaAwareness,
            glucagonAvailable: data.glucagonAvailable,
            lastHbA1c: data.lastHbA1c ?? undefined,
            adjustmentsMade: data.adjustmentsMade ?? undefined,
            sideEffects: data.sideEffects ?? undefined,
            adherence: data.adherence ?? undefined,
            isActive: data.isActive,
            notes: data.notes ?? undefined,
        };

        if (data.prescriptionDate) {
            updateData.prescriptionDate = new Date(data.prescriptionDate);
        }

        return prisma.endoInsulin.update({
            where: { id },
            data: updateData,
            include: insulinInclude,
        });
    }

    async delete(id: string) {
        return prisma.endoInsulin.delete({
            where: { id },
        });
    }
}

export const endocrinologyInsulinService = new EndocrinologyInsulinService();
