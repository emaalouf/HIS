import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyCognitiveAssessmentInclude = {
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

export class NeurologyCognitiveAssessmentService {
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
            sortBy = 'assessmentDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologyCognitiveAssessmentWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.assessmentDate = {};
            if (startDate) where.assessmentDate.gte = new Date(startDate);
            if (endDate) where.assessmentDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { diagnosis: { contains: search } },
                { overallImpression: { contains: search } },
                { recommendations: { contains: search } },
            ];
        }

        const [assessments, total] = await Promise.all([
            prisma.neurologyCognitiveAssessment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyCognitiveAssessmentInclude,
            }),
            prisma.neurologyCognitiveAssessment.count({ where }),
        ]);

        return { assessments, total };
    }

    async findById(id: string) {
        return prisma.neurologyCognitiveAssessment.findUnique({
            where: { id },
            include: neurologyCognitiveAssessmentInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        assessmentDate: string;
        mmseScore?: number | null;
        mocaScore?: number | null;
        clockDrawingTest?: string | null;
        verbalFluencyScore?: number | null;
        trailMakingA?: number | null;
        trailMakingB?: number | null;
        delayedRecall?: number | null;
        attentionTest?: string | null;
        languageAssessment?: string | null;
        visuospatialScore?: number | null;
        executiveFunction?: string | null;
        overallImpression?: string | null;
        diagnosis?: string | null;
        recommendations?: string | null;
        followUpNeeded?: boolean | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.neurologyCognitiveAssessment.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                assessmentDate: new Date(data.assessmentDate),
                mmseScore: data.mmseScore ?? undefined,
                mocaScore: data.mocaScore ?? undefined,
                clockDrawingTest: data.clockDrawingTest ?? undefined,
                verbalFluencyScore: data.verbalFluencyScore ?? undefined,
                trailMakingA: data.trailMakingA ?? undefined,
                trailMakingB: data.trailMakingB ?? undefined,
                delayedRecall: data.delayedRecall ?? undefined,
                attentionTest: data.attentionTest ?? undefined,
                languageAssessment: data.languageAssessment ?? undefined,
                visuospatialScore: data.visuospatialScore ?? undefined,
                executiveFunction: data.executiveFunction ?? undefined,
                overallImpression: data.overallImpression ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                recommendations: data.recommendations ?? undefined,
                followUpNeeded: data.followUpNeeded ?? undefined,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyCognitiveAssessmentInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        assessmentDate?: string;
        mmseScore?: number | null;
        mocaScore?: number | null;
        clockDrawingTest?: string | null;
        verbalFluencyScore?: number | null;
        trailMakingA?: number | null;
        trailMakingB?: number | null;
        delayedRecall?: number | null;
        attentionTest?: string | null;
        languageAssessment?: string | null;
        visuospatialScore?: number | null;
        executiveFunction?: string | null;
        overallImpression?: string | null;
        diagnosis?: string | null;
        recommendations?: string | null;
        followUpNeeded?: boolean | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyCognitiveAssessmentUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            mmseScore: data.mmseScore ?? undefined,
            mocaScore: data.mocaScore ?? undefined,
            clockDrawingTest: data.clockDrawingTest ?? undefined,
            verbalFluencyScore: data.verbalFluencyScore ?? undefined,
            trailMakingA: data.trailMakingA ?? undefined,
            trailMakingB: data.trailMakingB ?? undefined,
            delayedRecall: data.delayedRecall ?? undefined,
            attentionTest: data.attentionTest ?? undefined,
            languageAssessment: data.languageAssessment ?? undefined,
            visuospatialScore: data.visuospatialScore ?? undefined,
            executiveFunction: data.executiveFunction ?? undefined,
            overallImpression: data.overallImpression ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            recommendations: data.recommendations ?? undefined,
            followUpNeeded: data.followUpNeeded ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.assessmentDate) {
            updateData.assessmentDate = new Date(data.assessmentDate);
        }
        if (data.followUpDate !== undefined) {
            updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
        }

        return prisma.neurologyCognitiveAssessment.update({
            where: { id },
            data: updateData,
            include: neurologyCognitiveAssessmentInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyCognitiveAssessment.delete({
            where: { id },
        });
    }
}

export const neurologyCognitiveAssessmentService = new NeurologyCognitiveAssessmentService();
