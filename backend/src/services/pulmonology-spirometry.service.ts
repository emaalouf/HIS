import { SpirometryQuality, Prisma } from '@prisma/client';
import prisma from '../config/database';

const spirometryInclude = {
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

export class PulmonologySpirometryService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
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
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'testDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PulmonologySpirometryWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.testDate = {};
            if (startDate) where.testDate.gte = new Date(startDate);
            if (endDate) where.testDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { indication: { contains: search } },
                { diagnosis: { contains: search } },
            ];
        }

        const [tests, total] = await Promise.all([
            prisma.pulmonologySpirometry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: spirometryInclude,
            }),
            prisma.pulmonologySpirometry.count({ where }),
        ]);

        return { tests, total };
    }

    async findById(id: string) {
        return prisma.pulmonologySpirometry.findUnique({
            where: { id },
            include: spirometryInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        testDate: string;
        indication?: string | null;
        qualityGrade: SpirometryQuality;
        fev1: number;
        fvc: number;
        fev1FvcRatio: number;
        predictedFev1?: number | null;
        predictedFvc?: number | null;
        percentPredictedFev1?: number | null;
        percentPredictedFvc?: number | null;
        fef2575?: number | null;
        bronchodilatorGiven?: boolean;
        postBdFev1?: number | null;
        postBdFvc?: number | null;
        postBdRatio?: number | null;
        significantResponse?: boolean;
        interpretation?: string | null;
        diagnosis?: string | null;
        notes?: string | null;
    }) {
        return prisma.pulmonologySpirometry.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                testDate: new Date(data.testDate),
                indication: data.indication ?? undefined,
                qualityGrade: data.qualityGrade,
                fev1: data.fev1,
                fvc: data.fvc,
                fev1FvcRatio: data.fev1FvcRatio,
                predictedFev1: data.predictedFev1 ?? undefined,
                predictedFvc: data.predictedFvc ?? undefined,
                percentPredictedFev1: data.percentPredictedFev1 ?? undefined,
                percentPredictedFvc: data.percentPredictedFvc ?? undefined,
                fef2575: data.fef2575 ?? undefined,
                bronchodilatorGiven: data.bronchodilatorGiven,
                postBdFev1: data.postBdFev1 ?? undefined,
                postBdFvc: data.postBdFvc ?? undefined,
                postBdRatio: data.postBdRatio ?? undefined,
                significantResponse: data.significantResponse,
                interpretation: data.interpretation ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: spirometryInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        testDate?: string;
        indication?: string | null;
        qualityGrade?: SpirometryQuality;
        fev1?: number;
        fvc?: number;
        fev1FvcRatio?: number;
        predictedFev1?: number | null;
        predictedFvc?: number | null;
        percentPredictedFev1?: number | null;
        percentPredictedFvc?: number | null;
        fef2575?: number | null;
        bronchodilatorGiven?: boolean;
        postBdFev1?: number | null;
        postBdFvc?: number | null;
        postBdRatio?: number | null;
        significantResponse?: boolean;
        interpretation?: string | null;
        diagnosis?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PulmonologySpirometryUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            indication: data.indication ?? undefined,
            qualityGrade: data.qualityGrade,
            fev1: data.fev1,
            fvc: data.fvc,
            fev1FvcRatio: data.fev1FvcRatio,
            predictedFev1: data.predictedFev1 ?? undefined,
            predictedFvc: data.predictedFvc ?? undefined,
            percentPredictedFev1: data.percentPredictedFev1 ?? undefined,
            percentPredictedFvc: data.percentPredictedFvc ?? undefined,
            fef2575: data.fef2575 ?? undefined,
            bronchodilatorGiven: data.bronchodilatorGiven,
            postBdFev1: data.postBdFev1 ?? undefined,
            postBdFvc: data.postBdFvc ?? undefined,
            postBdRatio: data.postBdRatio ?? undefined,
            significantResponse: data.significantResponse,
            interpretation: data.interpretation ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.testDate) {
            updateData.testDate = new Date(data.testDate);
        }

        return prisma.pulmonologySpirometry.update({
            where: { id },
            data: updateData,
            include: spirometryInclude,
        });
    }

    async delete(id: string) {
        return prisma.pulmonologySpirometry.delete({
            where: { id },
        });
    }
}

export const pulmonologySpirometryService = new PulmonologySpirometryService();
