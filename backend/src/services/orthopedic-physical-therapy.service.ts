import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const orthopedicPhysicalTherapyInclude = {
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

export class OrthopedicPhysicalTherapyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        currentStatus?: string;
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
            currentStatus,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'referralDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OrthopedicPhysicalTherapyWhereInput = {};

        if (currentStatus) where.currentStatus = currentStatus;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.referralDate = {};
            if (startDate) where.referralDate.gte = new Date(startDate);
            if (endDate) where.referralDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { diagnosis: { contains: search } },
                { treatmentGoals: { contains: search } },
            ];
        }

        const [therapies, total] = await Promise.all([
            prisma.orthopedicPhysicalTherapy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: orthopedicPhysicalTherapyInclude,
            }),
            prisma.orthopedicPhysicalTherapy.count({ where }),
        ]);

        return { therapies, total };
    }

    async findById(id: string) {
        return prisma.orthopedicPhysicalTherapy.findUnique({
            where: { id },
            include: orthopedicPhysicalTherapyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        referralDate: string;
        diagnosis?: string | null;
        treatmentGoals?: string | null;
        sessionsPlanned?: number;
        sessionsCompleted?: number;
        currentStatus?: string | null;
        modalities?: string | null;
        therapeuticExercises?: string | null;
        gaitTraining?: string | null;
        balanceTraining?: string | null;
        strengthening?: string | null;
        rangeOfMotion?: string | null;
        functionalActivities?: string | null;
        painLevel?: string | null;
        progressNotes?: string | null;
        nextSessionDate?: string | null;
        dischargeDate?: string | null;
        dischargeStatus?: string | null;
        notes?: string | null;
    }) {
        return prisma.orthopedicPhysicalTherapy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                referralDate: new Date(data.referralDate),
                diagnosis: data.diagnosis ?? undefined,
                treatmentGoals: data.treatmentGoals ?? undefined,
                sessionsPlanned: data.sessionsPlanned,
                sessionsCompleted: data.sessionsCompleted,
                currentStatus: data.currentStatus ?? undefined,
                modalities: data.modalities ?? undefined,
                therapeuticExercises: data.therapeuticExercises ?? undefined,
                gaitTraining: data.gaitTraining ?? undefined,
                balanceTraining: data.balanceTraining ?? undefined,
                strengthening: data.strengthening ?? undefined,
                rangeOfMotion: data.rangeOfMotion ?? undefined,
                functionalActivities: data.functionalActivities ?? undefined,
                painLevel: data.painLevel ?? undefined,
                progressNotes: data.progressNotes ?? undefined,
                nextSessionDate: data.nextSessionDate ? new Date(data.nextSessionDate) : undefined,
                dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
                dischargeStatus: data.dischargeStatus ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: orthopedicPhysicalTherapyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        referralDate?: string;
        diagnosis?: string | null;
        treatmentGoals?: string | null;
        sessionsPlanned?: number;
        sessionsCompleted?: number;
        currentStatus?: string | null;
        modalities?: string | null;
        therapeuticExercises?: string | null;
        gaitTraining?: string | null;
        balanceTraining?: string | null;
        strengthening?: string | null;
        rangeOfMotion?: string | null;
        functionalActivities?: string | null;
        painLevel?: string | null;
        progressNotes?: string | null;
        nextSessionDate?: string | null;
        dischargeDate?: string | null;
        dischargeStatus?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OrthopedicPhysicalTherapyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            diagnosis: data.diagnosis ?? undefined,
            treatmentGoals: data.treatmentGoals ?? undefined,
            sessionsPlanned: data.sessionsPlanned,
            sessionsCompleted: data.sessionsCompleted,
            currentStatus: data.currentStatus ?? undefined,
            modalities: data.modalities ?? undefined,
            therapeuticExercises: data.therapeuticExercises ?? undefined,
            gaitTraining: data.gaitTraining ?? undefined,
            balanceTraining: data.balanceTraining ?? undefined,
            strengthening: data.strengthening ?? undefined,
            rangeOfMotion: data.rangeOfMotion ?? undefined,
            functionalActivities: data.functionalActivities ?? undefined,
            painLevel: data.painLevel ?? undefined,
            progressNotes: data.progressNotes ?? undefined,
            dischargeStatus: data.dischargeStatus ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.referralDate) {
            updateData.referralDate = new Date(data.referralDate);
        }
        if (data.nextSessionDate) {
            updateData.nextSessionDate = new Date(data.nextSessionDate);
        }
        if (data.dischargeDate) {
            updateData.dischargeDate = new Date(data.dischargeDate);
        }

        return prisma.orthopedicPhysicalTherapy.update({
            where: { id },
            data: updateData,
            include: orthopedicPhysicalTherapyInclude,
        });
    }

    async delete(id: string) {
        return prisma.orthopedicPhysicalTherapy.delete({
            where: { id },
        });
    }
}

export const orthopedicPhysicalTherapyService = new OrthopedicPhysicalTherapyService();
