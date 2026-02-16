import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const pedsDevelopmentalInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
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

export class PedsDevelopmentalService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        concernsIdentified?: boolean;
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
            concernsIdentified,
            startDate,
            endDate,
            sortBy = 'assessmentDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PedsDevelopmentalWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (concernsIdentified !== undefined) where.concernsIdentified = concernsIdentified;

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
                { concernsDescription: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [assessments, total] = await Promise.all([
            prisma.pedsDevelopmental.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: pedsDevelopmentalInclude,
            }),
            prisma.pedsDevelopmental.count({ where }),
        ]);

        return { assessments, total };
    }

    async findById(id: string) {
        return prisma.pedsDevelopmental.findUnique({
            where: { id },
            include: pedsDevelopmentalInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        assessmentDate: string;
        ageMonths?: number | null;
        grossMotor?: string | null;
        fineMotor?: string | null;
        language?: string | null;
        socialEmotional?: string | null;
        cognitive?: string | null;
        problemSolving?: string | null;
        personalSocial?: string | null;
        concernsIdentified?: boolean | null;
        concernsDescription?: string | null;
        milestonesAchieved?: string | null;
        milestonesDelayed?: string | null;
        asqCompleted?: boolean | null;
        asqScore?: number | null;
        mchatCompleted?: boolean | null;
        mchatScore?: number | null;
        autismScreenPositive?: boolean | null;
        earlyInterventionReferral?: boolean | null;
        speechTherapyReferral?: boolean | null;
        occupationalTherapyReferral?: boolean | null;
        hearingTestDone?: boolean | null;
        visionTestDone?: boolean | null;
        followUpNeeded?: boolean | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.pedsDevelopmental.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                assessmentDate: new Date(data.assessmentDate),
                ageMonths: data.ageMonths ?? undefined,
                grossMotor: data.grossMotor ?? undefined,
                fineMotor: data.fineMotor ?? undefined,
                language: data.language ?? undefined,
                socialEmotional: data.socialEmotional ?? undefined,
                cognitive: data.cognitive ?? undefined,
                problemSolving: data.problemSolving ?? undefined,
                personalSocial: data.personalSocial ?? undefined,
                concernsIdentified: data.concernsIdentified ?? undefined,
                concernsDescription: data.concernsDescription ?? undefined,
                milestonesAchieved: data.milestonesAchieved ?? undefined,
                milestonesDelayed: data.milestonesDelayed ?? undefined,
                asqCompleted: data.asqCompleted ?? undefined,
                asqScore: data.asqScore ?? undefined,
                mchatCompleted: data.mchatCompleted ?? undefined,
                mchatScore: data.mchatScore ?? undefined,
                autismScreenPositive: data.autismScreenPositive ?? undefined,
                earlyInterventionReferral: data.earlyInterventionReferral ?? undefined,
                speechTherapyReferral: data.speechTherapyReferral ?? undefined,
                occupationalTherapyReferral: data.occupationalTherapyReferral ?? undefined,
                hearingTestDone: data.hearingTestDone ?? undefined,
                visionTestDone: data.visionTestDone ?? undefined,
                followUpNeeded: data.followUpNeeded ?? undefined,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: pedsDevelopmentalInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        assessmentDate?: string;
        ageMonths?: number | null;
        grossMotor?: string | null;
        fineMotor?: string | null;
        language?: string | null;
        socialEmotional?: string | null;
        cognitive?: string | null;
        problemSolving?: string | null;
        personalSocial?: string | null;
        concernsIdentified?: boolean | null;
        concernsDescription?: string | null;
        milestonesAchieved?: string | null;
        milestonesDelayed?: string | null;
        asqCompleted?: boolean | null;
        asqScore?: number | null;
        mchatCompleted?: boolean | null;
        mchatScore?: number | null;
        autismScreenPositive?: boolean | null;
        earlyInterventionReferral?: boolean | null;
        speechTherapyReferral?: boolean | null;
        occupationalTherapyReferral?: boolean | null;
        hearingTestDone?: boolean | null;
        visionTestDone?: boolean | null;
        followUpNeeded?: boolean | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PedsDevelopmentalUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            ageMonths: data.ageMonths ?? undefined,
            grossMotor: data.grossMotor ?? undefined,
            fineMotor: data.fineMotor ?? undefined,
            language: data.language ?? undefined,
            socialEmotional: data.socialEmotional ?? undefined,
            cognitive: data.cognitive ?? undefined,
            problemSolving: data.problemSolving ?? undefined,
            personalSocial: data.personalSocial ?? undefined,
            concernsIdentified: data.concernsIdentified ?? undefined,
            concernsDescription: data.concernsDescription ?? undefined,
            milestonesAchieved: data.milestonesAchieved ?? undefined,
            milestonesDelayed: data.milestonesDelayed ?? undefined,
            asqCompleted: data.asqCompleted ?? undefined,
            asqScore: data.asqScore ?? undefined,
            mchatCompleted: data.mchatCompleted ?? undefined,
            mchatScore: data.mchatScore ?? undefined,
            autismScreenPositive: data.autismScreenPositive ?? undefined,
            earlyInterventionReferral: data.earlyInterventionReferral ?? undefined,
            speechTherapyReferral: data.speechTherapyReferral ?? undefined,
            occupationalTherapyReferral: data.occupationalTherapyReferral ?? undefined,
            hearingTestDone: data.hearingTestDone ?? undefined,
            visionTestDone: data.visionTestDone ?? undefined,
            followUpNeeded: data.followUpNeeded ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.assessmentDate) {
            updateData.assessmentDate = new Date(data.assessmentDate);
        }
        if (data.followUpDate !== undefined) {
            updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
        }

        return prisma.pedsDevelopmental.update({
            where: { id },
            data: updateData,
            include: pedsDevelopmentalInclude,
        });
    }

    async delete(id: string) {
        return prisma.pedsDevelopmental.delete({
            where: { id },
        });
    }
}

export const pedsDevelopmentalService = new PedsDevelopmentalService();
