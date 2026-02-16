import { TumorBoardStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const tumorBoardInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
    presenter: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    },
};

export class OncologyTumorBoardService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: TumorBoardStatus;
        patientId?: string;
        presenterId?: string;
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
            presenterId,
            startDate,
            endDate,
            sortBy = 'meetingDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OncologyTumorBoardWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (presenterId) where.presenterId = presenterId;

        if (startDate || endDate) {
            where.meetingDate = {};
            if (startDate) where.meetingDate.gte = new Date(startDate);
            if (endDate) where.meetingDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { presenter: { firstName: { contains: search } } },
                { presenter: { lastName: { contains: search } } },
                { cancerType: { contains: search } },
                { casePresentation: { contains: search } },
            ];
        }

        const [tumorBoards, total] = await Promise.all([
            prisma.oncologyTumorBoard.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: tumorBoardInclude,
            }),
            prisma.oncologyTumorBoard.count({ where }),
        ]);

        return { tumorBoards, total };
    }

    async findById(id: string) {
        return prisma.oncologyTumorBoard.findUnique({
            where: { id },
            include: tumorBoardInclude,
        });
    }

    async create(data: {
        patientId: string;
        presenterId: string;
        status?: TumorBoardStatus;
        meetingDate: string;
        cancerType: string;
        stage?: string | null;
        casePresentation?: string | null;
        imagingReviewed?: boolean | null;
        pathologyReviewed?: boolean | null;
        molecularTesting?: string | null;
        treatmentOptions?: string | null;
        recommendedPlan?: string | null;
        clinicalTrialOffered?: boolean | null;
        trialName?: string | null;
        attendees?: string | null;
        consensusReached?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.oncologyTumorBoard.create({
            data: {
                patientId: data.patientId,
                presenterId: data.presenterId,
                status: data.status,
                meetingDate: new Date(data.meetingDate),
                cancerType: data.cancerType,
                stage: data.stage ?? undefined,
                casePresentation: data.casePresentation ?? undefined,
                imagingReviewed: data.imagingReviewed ?? undefined,
                pathologyReviewed: data.pathologyReviewed ?? undefined,
                molecularTesting: data.molecularTesting ?? undefined,
                treatmentOptions: data.treatmentOptions ?? undefined,
                recommendedPlan: data.recommendedPlan ?? undefined,
                clinicalTrialOffered: data.clinicalTrialOffered ?? undefined,
                trialName: data.trialName ?? undefined,
                attendees: data.attendees ?? undefined,
                consensusReached: data.consensusReached ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: tumorBoardInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        presenterId?: string;
        status?: TumorBoardStatus;
        meetingDate?: string;
        cancerType?: string;
        stage?: string | null;
        casePresentation?: string | null;
        imagingReviewed?: boolean | null;
        pathologyReviewed?: boolean | null;
        molecularTesting?: string | null;
        treatmentOptions?: string | null;
        recommendedPlan?: string | null;
        clinicalTrialOffered?: boolean | null;
        trialName?: string | null;
        attendees?: string | null;
        consensusReached?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OncologyTumorBoardUncheckedUpdateInput = {
            patientId: data.patientId,
            presenterId: data.presenterId,
            status: data.status,
            cancerType: data.cancerType,
            stage: data.stage ?? undefined,
            casePresentation: data.casePresentation ?? undefined,
            imagingReviewed: data.imagingReviewed ?? undefined,
            pathologyReviewed: data.pathologyReviewed ?? undefined,
            molecularTesting: data.molecularTesting ?? undefined,
            treatmentOptions: data.treatmentOptions ?? undefined,
            recommendedPlan: data.recommendedPlan ?? undefined,
            clinicalTrialOffered: data.clinicalTrialOffered ?? undefined,
            trialName: data.trialName ?? undefined,
            attendees: data.attendees ?? undefined,
            consensusReached: data.consensusReached ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.meetingDate) {
            updateData.meetingDate = new Date(data.meetingDate);
        }

        return prisma.oncologyTumorBoard.update({
            where: { id },
            data: updateData,
            include: tumorBoardInclude,
        });
    }

    async delete(id: string) {
        return prisma.oncologyTumorBoard.delete({
            where: { id },
        });
    }
}

export const oncologyTumorBoardService = new OncologyTumorBoardService();
