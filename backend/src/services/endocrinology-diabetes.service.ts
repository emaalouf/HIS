import { DiabetesType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const diabetesInclude = {
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

export class EndocrinologyDiabetesService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        diabetesType?: DiabetesType;
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
            diabetesType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'diagnosisDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.EndoDiabetesWhereInput = {};

        if (diabetesType) where.diabetesType = diabetesType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.diagnosisDate = {};
            if (startDate) where.diagnosisDate.gte = new Date(startDate);
            if (endDate) where.diagnosisDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { complications: { contains: search } },
            ];
        }

        const [records, total] = await Promise.all([
            prisma.endoDiabetes.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: diabetesInclude,
            }),
            prisma.endoDiabetes.count({ where }),
        ]);

        return { records, total };
    }

    async findById(id: string) {
        return prisma.endoDiabetes.findUnique({
            where: { id },
            include: diabetesInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        diagnosisDate: string;
        diabetesType: DiabetesType;
        hba1cAtDiagnosis?: number | null;
        currentHbA1c?: number | null;
        hba1cDate?: string | null;
        fastingGlucose?: number | null;
        postprandialGlucose?: number | null;
        targetFasting?: number;
        targetPostprandial?: number;
        targetHbA1c?: number;
        complications?: string | null;
        retinopathy?: boolean;
        nephropathy?: boolean;
        neuropathy?: boolean;
        cardiovascular?: boolean;
        footExamDate?: string | null;
        footExamFindings?: string | null;
        eyeExamDate?: string | null;
        eyeExamFindings?: string | null;
        lastNephrologyReferral?: string | null;
        dietitianReferral?: boolean;
        diabetesEducator?: boolean;
        selfMonitoring?: boolean;
        monitoringFrequency?: string | null;
        lifestyleModifications?: string | null;
        notes?: string | null;
    }) {
        return prisma.endoDiabetes.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                diagnosisDate: new Date(data.diagnosisDate),
                diabetesType: data.diabetesType,
                hba1cAtDiagnosis: data.hba1cAtDiagnosis ?? undefined,
                currentHbA1c: data.currentHbA1c ?? undefined,
                hba1cDate: data.hba1cDate ? new Date(data.hba1cDate) : undefined,
                fastingGlucose: data.fastingGlucose ?? undefined,
                postprandialGlucose: data.postprandialGlucose ?? undefined,
                targetFasting: data.targetFasting,
                targetPostprandial: data.targetPostprandial,
                targetHbA1c: data.targetHbA1c,
                complications: data.complications ?? undefined,
                retinopathy: data.retinopathy,
                nephropathy: data.nephropathy,
                neuropathy: data.neuropathy,
                cardiovascular: data.cardiovascular,
                footExamDate: data.footExamDate ? new Date(data.footExamDate) : undefined,
                footExamFindings: data.footExamFindings ?? undefined,
                eyeExamDate: data.eyeExamDate ? new Date(data.eyeExamDate) : undefined,
                eyeExamFindings: data.eyeExamFindings ?? undefined,
                lastNephrologyReferral: data.lastNephrologyReferral ? new Date(data.lastNephrologyReferral) : undefined,
                dietitianReferral: data.dietitianReferral,
                diabetesEducator: data.diabetesEducator,
                selfMonitoring: data.selfMonitoring,
                monitoringFrequency: data.monitoringFrequency ?? undefined,
                lifestyleModifications: data.lifestyleModifications ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: diabetesInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        diagnosisDate?: string;
        diabetesType?: DiabetesType;
        hba1cAtDiagnosis?: number | null;
        currentHbA1c?: number | null;
        hba1cDate?: string | null;
        fastingGlucose?: number | null;
        postprandialGlucose?: number | null;
        targetFasting?: number;
        targetPostprandial?: number;
        targetHbA1c?: number;
        complications?: string | null;
        retinopathy?: boolean;
        nephropathy?: boolean;
        neuropathy?: boolean;
        cardiovascular?: boolean;
        footExamDate?: string | null;
        footExamFindings?: string | null;
        eyeExamDate?: string | null;
        eyeExamFindings?: string | null;
        lastNephrologyReferral?: string | null;
        dietitianReferral?: boolean;
        diabetesEducator?: boolean;
        selfMonitoring?: boolean;
        monitoringFrequency?: string | null;
        lifestyleModifications?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.EndoDiabetesUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            diabetesType: data.diabetesType,
            hba1cAtDiagnosis: data.hba1cAtDiagnosis ?? undefined,
            currentHbA1c: data.currentHbA1c ?? undefined,
            fastingGlucose: data.fastingGlucose ?? undefined,
            postprandialGlucose: data.postprandialGlucose ?? undefined,
            targetFasting: data.targetFasting,
            targetPostprandial: data.targetPostprandial,
            targetHbA1c: data.targetHbA1c,
            complications: data.complications ?? undefined,
            retinopathy: data.retinopathy,
            nephropathy: data.nephropathy,
            neuropathy: data.neuropathy,
            cardiovascular: data.cardiovascular,
            footExamFindings: data.footExamFindings ?? undefined,
            eyeExamFindings: data.eyeExamFindings ?? undefined,
            dietitianReferral: data.dietitianReferral,
            diabetesEducator: data.diabetesEducator,
            selfMonitoring: data.selfMonitoring,
            monitoringFrequency: data.monitoringFrequency ?? undefined,
            lifestyleModifications: data.lifestyleModifications ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.diagnosisDate) {
            updateData.diagnosisDate = new Date(data.diagnosisDate);
        }
        if (data.hba1cDate) {
            updateData.hba1cDate = new Date(data.hba1cDate);
        }
        if (data.footExamDate) {
            updateData.footExamDate = new Date(data.footExamDate);
        }
        if (data.eyeExamDate) {
            updateData.eyeExamDate = new Date(data.eyeExamDate);
        }
        if (data.lastNephrologyReferral) {
            updateData.lastNephrologyReferral = new Date(data.lastNephrologyReferral);
        }

        return prisma.endoDiabetes.update({
            where: { id },
            data: updateData,
            include: diabetesInclude,
        });
    }

    async delete(id: string) {
        return prisma.endoDiabetes.delete({
            where: { id },
        });
    }
}

export const endocrinologyDiabetesService = new EndocrinologyDiabetesService();
