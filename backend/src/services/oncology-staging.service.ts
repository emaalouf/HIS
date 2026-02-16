import { CancerStage, Prisma } from '@prisma/client';
import prisma from '../config/database';

const stagingInclude = {
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

export class OncologyStagingService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        overallStage?: CancerStage;
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
            overallStage,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'stagingDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OncologyStagingWhereInput = {};

        if (overallStage) where.overallStage = overallStage;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.stagingDate = {};
            if (startDate) where.stagingDate.gte = new Date(startDate);
            if (endDate) where.stagingDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { cancerType: { contains: search } },
                { histology: { contains: search } },
            ];
        }

        const [stagings, total] = await Promise.all([
            prisma.oncologyStaging.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: stagingInclude,
            }),
            prisma.oncologyStaging.count({ where }),
        ]);

        return { stagings, total };
    }

    async findById(id: string) {
        return prisma.oncologyStaging.findUnique({
            where: { id },
            include: stagingInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        cancerType: string;
        histology?: string | null;
        grade?: string | null;
        tStage?: string | null;
        nStage?: string | null;
        mStage?: string | null;
        overallStage?: CancerStage;
        stageGrouping?: string | null;
        stagingDate: string;
        stagingMethod?: string | null;
        tumorSizeCm?: number | null;
        nodesPositive?: number | null;
        nodesExamined?: number | null;
        metastasisSites?: string | null;
        biomarkers?: string | null;
        stagingImaging?: string | null;
        pathologyReport?: string | null;
        notes?: string | null;
    }) {
        return prisma.oncologyStaging.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                cancerType: data.cancerType,
                histology: data.histology ?? undefined,
                grade: data.grade ?? undefined,
                tStage: data.tStage ?? undefined,
                nStage: data.nStage ?? undefined,
                mStage: data.mStage ?? undefined,
                overallStage: data.overallStage,
                stageGrouping: data.stageGrouping ?? undefined,
                stagingDate: new Date(data.stagingDate),
                stagingMethod: data.stagingMethod ?? undefined,
                tumorSizeCm: data.tumorSizeCm ?? undefined,
                nodesPositive: data.nodesPositive ?? undefined,
                nodesExamined: data.nodesExamined ?? undefined,
                metastasisSites: data.metastasisSites ?? undefined,
                biomarkers: data.biomarkers ?? undefined,
                stagingImaging: data.stagingImaging ?? undefined,
                pathologyReport: data.pathologyReport ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: stagingInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        cancerType?: string;
        histology?: string | null;
        grade?: string | null;
        tStage?: string | null;
        nStage?: string | null;
        mStage?: string | null;
        overallStage?: CancerStage;
        stageGrouping?: string | null;
        stagingDate?: string;
        stagingMethod?: string | null;
        tumorSizeCm?: number | null;
        nodesPositive?: number | null;
        nodesExamined?: number | null;
        metastasisSites?: string | null;
        biomarkers?: string | null;
        stagingImaging?: string | null;
        pathologyReport?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OncologyStagingUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            cancerType: data.cancerType,
            histology: data.histology ?? undefined,
            grade: data.grade ?? undefined,
            tStage: data.tStage ?? undefined,
            nStage: data.nStage ?? undefined,
            mStage: data.mStage ?? undefined,
            overallStage: data.overallStage,
            stageGrouping: data.stageGrouping ?? undefined,
            stagingMethod: data.stagingMethod ?? undefined,
            tumorSizeCm: data.tumorSizeCm ?? undefined,
            nodesPositive: data.nodesPositive ?? undefined,
            nodesExamined: data.nodesExamined ?? undefined,
            metastasisSites: data.metastasisSites ?? undefined,
            biomarkers: data.biomarkers ?? undefined,
            stagingImaging: data.stagingImaging ?? undefined,
            pathologyReport: data.pathologyReport ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.stagingDate) {
            updateData.stagingDate = new Date(data.stagingDate);
        }

        return prisma.oncologyStaging.update({
            where: { id },
            data: updateData,
            include: stagingInclude,
        });
    }

    async delete(id: string) {
        return prisma.oncologyStaging.delete({
            where: { id },
        });
    }
}

export const oncologyStagingService = new OncologyStagingService();
