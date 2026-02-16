import { Trimester, Prisma } from '@prisma/client';
import prisma from '../config/database';

const obgynAntenatalInclude = {
    pregnancy: {
        include: {
            patient: {
                select: {
                    id: true,
                    mrn: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            },
        },
    },
};

export class ObgynAntenatalService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        pregnancyId?: string;
        trimester?: Trimester;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            pregnancyId,
            trimester,
            startDate,
            endDate,
            sortBy = 'visitDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ObgynAntenatalWhereInput = {};

        if (pregnancyId) where.pregnancyId = pregnancyId;
        if (trimester) where.trimester = trimester;

        if (startDate || endDate) {
            where.visitDate = {};
            if (startDate) where.visitDate.gte = new Date(startDate);
            if (endDate) where.visitDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { pregnancy: { patient: { firstName: { contains: search } } } },
                { pregnancy: { patient: { lastName: { contains: search } } } },
                { pregnancy: { patient: { mrn: { contains: search } } } },
                { complaints: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [visits, total] = await Promise.all([
            prisma.obgynAntenatal.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: obgynAntenatalInclude,
            }),
            prisma.obgynAntenatal.count({ where }),
        ]);

        return { visits, total };
    }

    async findById(id: string) {
        return prisma.obgynAntenatal.findUnique({
            where: { id },
            include: obgynAntenatalInclude,
        });
    }

    async create(data: {
        pregnancyId: string;
        visitDate: string;
        gestationalAgeWeeks?: number | null;
        trimester?: Trimester;
        weight?: number | null;
        bloodPressure?: string | null;
        fundalHeight?: number | null;
        fetalHeartRate?: number | null;
        fetalMovement?: string | null;
        presentation?: string | null;
        edema?: string | null;
        proteinuria?: string | null;
        glucosuria?: string | null;
        hemoglobin?: number | null;
        ultrasoundFindings?: string | null;
        screeningTests?: string | null;
        medications?: string | null;
        complaints?: string | null;
        nextVisitDate?: string | null;
        riskAssessment?: string | null;
        referralNeeded?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.obgynAntenatal.create({
            data: {
                pregnancyId: data.pregnancyId,
                visitDate: new Date(data.visitDate),
                gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
                trimester: data.trimester,
                weight: data.weight ?? undefined,
                bloodPressure: data.bloodPressure ?? undefined,
                fundalHeight: data.fundalHeight ?? undefined,
                fetalHeartRate: data.fetalHeartRate ?? undefined,
                fetalMovement: data.fetalMovement ?? undefined,
                presentation: data.presentation ?? undefined,
                edema: data.edema ?? undefined,
                proteinuria: data.proteinuria ?? undefined,
                glucosuria: data.glucosuria ?? undefined,
                hemoglobin: data.hemoglobin ?? undefined,
                ultrasoundFindings: data.ultrasoundFindings ?? undefined,
                screeningTests: data.screeningTests ?? undefined,
                medications: data.medications ?? undefined,
                complaints: data.complaints ?? undefined,
                nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
                riskAssessment: data.riskAssessment ?? undefined,
                referralNeeded: data.referralNeeded ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: obgynAntenatalInclude,
        });
    }

    async update(id: string, data: {
        pregnancyId?: string;
        visitDate?: string;
        gestationalAgeWeeks?: number | null;
        trimester?: Trimester;
        weight?: number | null;
        bloodPressure?: string | null;
        fundalHeight?: number | null;
        fetalHeartRate?: number | null;
        fetalMovement?: string | null;
        presentation?: string | null;
        edema?: string | null;
        proteinuria?: string | null;
        glucosuria?: string | null;
        hemoglobin?: number | null;
        ultrasoundFindings?: string | null;
        screeningTests?: string | null;
        medications?: string | null;
        complaints?: string | null;
        nextVisitDate?: string | null;
        riskAssessment?: string | null;
        referralNeeded?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.ObgynAntenatalUncheckedUpdateInput = {
            pregnancyId: data.pregnancyId,
            gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
            trimester: data.trimester,
            weight: data.weight ?? undefined,
            bloodPressure: data.bloodPressure ?? undefined,
            fundalHeight: data.fundalHeight ?? undefined,
            fetalHeartRate: data.fetalHeartRate ?? undefined,
            fetalMovement: data.fetalMovement ?? undefined,
            presentation: data.presentation ?? undefined,
            edema: data.edema ?? undefined,
            proteinuria: data.proteinuria ?? undefined,
            glucosuria: data.glucosuria ?? undefined,
            hemoglobin: data.hemoglobin ?? undefined,
            ultrasoundFindings: data.ultrasoundFindings ?? undefined,
            screeningTests: data.screeningTests ?? undefined,
            medications: data.medications ?? undefined,
            complaints: data.complaints ?? undefined,
            riskAssessment: data.riskAssessment ?? undefined,
            referralNeeded: data.referralNeeded ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.visitDate) {
            updateData.visitDate = new Date(data.visitDate);
        }
        if (data.nextVisitDate !== undefined) {
            updateData.nextVisitDate = data.nextVisitDate ? new Date(data.nextVisitDate) : null;
        }

        return prisma.obgynAntenatal.update({
            where: { id },
            data: updateData,
            include: obgynAntenatalInclude,
        });
    }

    async delete(id: string) {
        return prisma.obgynAntenatal.delete({
            where: { id },
        });
    }
}

export const obgynAntenatalService = new ObgynAntenatalService();
