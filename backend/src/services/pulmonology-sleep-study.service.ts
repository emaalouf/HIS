import { SleepApneaSeverity, Prisma } from '@prisma/client';
import prisma from '../config/database';

const sleepStudyInclude = {
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

export class PulmonologySleepStudyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        severity?: SleepApneaSeverity;
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
            severity,
            startDate,
            endDate,
            sortBy = 'studyDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PulmonologySleepStudyWhereInput = {};

        if (severity) where.apneaSeverity = severity;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.studyDate = {};
            if (startDate) where.studyDate.gte = new Date(startDate);
            if (endDate) where.studyDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { studyType: { contains: search } },
            ];
        }

        const [studies, total] = await Promise.all([
            prisma.pulmonologySleepStudy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: sleepStudyInclude,
            }),
            prisma.pulmonologySleepStudy.count({ where }),
        ]);

        return { studies, total };
    }

    async findById(id: string) {
        return prisma.pulmonologySleepStudy.findUnique({
            where: { id },
            include: sleepStudyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        studyDate: string;
        studyType: string;
        ahi: number;
        rdi?: number | null;
        odi?: number | null;
        meanSpo2?: number | null;
        nadirSpo2?: number | null;
        timeBelow90?: number | null;
        sleepEfficiency?: number | null;
        totalSleepTime?: number | null;
        remPercentage?: number | null;
        deepSleepPercentage?: number | null;
        apneaSeverity: SleepApneaSeverity;
        centralApneaIndex?: number | null;
        obstructiveApneaIndex?: number | null;
        hypopneaIndex?: number | null;
        cpapRecommended?: boolean;
        cpapPressure?: number | null;
        bipapRecommended?: boolean;
        bipapSettings?: string | null;
        positionalTherapy?: boolean;
        oralAppliance?: boolean;
        surgicalEvaluation?: boolean;
        notes?: string | null;
    }) {
        return prisma.pulmonologySleepStudy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                studyDate: new Date(data.studyDate),
                studyType: data.studyType,
                ahi: data.ahi,
                rdi: data.rdi ?? undefined,
                odi: data.odi ?? undefined,
                meanSpo2: data.meanSpo2 ?? undefined,
                nadirSpo2: data.nadirSpo2 ?? undefined,
                timeBelow90: data.timeBelow90 ?? undefined,
                sleepEfficiency: data.sleepEfficiency ?? undefined,
                totalSleepTime: data.totalSleepTime ?? undefined,
                remPercentage: data.remPercentage ?? undefined,
                deepSleepPercentage: data.deepSleepPercentage ?? undefined,
                apneaSeverity: data.apneaSeverity,
                centralApneaIndex: data.centralApneaIndex ?? undefined,
                obstructiveApneaIndex: data.obstructiveApneaIndex ?? undefined,
                hypopneaIndex: data.hypopneaIndex ?? undefined,
                cpapRecommended: data.cpapRecommended,
                cpapPressure: data.cpapPressure ?? undefined,
                bipapRecommended: data.bipapRecommended,
                bipapSettings: data.bipapSettings ?? undefined,
                positionalTherapy: data.positionalTherapy,
                oralAppliance: data.oralAppliance,
                surgicalEvaluation: data.surgicalEvaluation,
                notes: data.notes ?? undefined,
            },
            include: sleepStudyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        studyDate?: string;
        studyType?: string;
        ahi?: number;
        rdi?: number | null;
        odi?: number | null;
        meanSpo2?: number | null;
        nadirSpo2?: number | null;
        timeBelow90?: number | null;
        sleepEfficiency?: number | null;
        totalSleepTime?: number | null;
        remPercentage?: number | null;
        deepSleepPercentage?: number | null;
        apneaSeverity?: SleepApneaSeverity;
        centralApneaIndex?: number | null;
        obstructiveApneaIndex?: number | null;
        hypopneaIndex?: number | null;
        cpapRecommended?: boolean;
        cpapPressure?: number | null;
        bipapRecommended?: boolean;
        bipapSettings?: string | null;
        positionalTherapy?: boolean;
        oralAppliance?: boolean;
        surgicalEvaluation?: boolean;
        notes?: string | null;
    }) {
        const updateData: Prisma.PulmonologySleepStudyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            studyType: data.studyType,
            ahi: data.ahi,
            rdi: data.rdi ?? undefined,
            odi: data.odi ?? undefined,
            meanSpo2: data.meanSpo2 ?? undefined,
            nadirSpo2: data.nadirSpo2 ?? undefined,
            timeBelow90: data.timeBelow90 ?? undefined,
            sleepEfficiency: data.sleepEfficiency ?? undefined,
            totalSleepTime: data.totalSleepTime ?? undefined,
            remPercentage: data.remPercentage ?? undefined,
            deepSleepPercentage: data.deepSleepPercentage ?? undefined,
            apneaSeverity: data.apneaSeverity,
            centralApneaIndex: data.centralApneaIndex ?? undefined,
            obstructiveApneaIndex: data.obstructiveApneaIndex ?? undefined,
            hypopneaIndex: data.hypopneaIndex ?? undefined,
            cpapRecommended: data.cpapRecommended,
            cpapPressure: data.cpapPressure ?? undefined,
            bipapRecommended: data.bipapRecommended,
            bipapSettings: data.bipapSettings ?? undefined,
            positionalTherapy: data.positionalTherapy,
            oralAppliance: data.oralAppliance,
            surgicalEvaluation: data.surgicalEvaluation,
            notes: data.notes ?? undefined,
        };

        if (data.studyDate) {
            updateData.studyDate = new Date(data.studyDate);
        }

        return prisma.pulmonologySleepStudy.update({
            where: { id },
            data: updateData,
            include: sleepStudyInclude,
        });
    }

    async delete(id: string) {
        return prisma.pulmonologySleepStudy.delete({
            where: { id },
        });
    }
}

export const pulmonologySleepStudyService = new PulmonologySleepStudyService();
