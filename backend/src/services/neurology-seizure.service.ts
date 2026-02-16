import { SeizureType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologySeizureInclude = {
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

export class NeurologySeizureService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        seizureType?: SeizureType;
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
            seizureType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'eventTime',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologySeizureWhereInput = {};

        if (seizureType) where.seizureType = seizureType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.eventTime = {};
            if (startDate) where.eventTime.gte = new Date(startDate);
            if (endDate) where.eventTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { witnessedBy: { contains: search } },
                { auraDescription: { contains: search } },
                { triggers: { contains: search } },
            ];
        }

        const [seizures, total] = await Promise.all([
            prisma.neurologySeizure.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologySeizureInclude,
            }),
            prisma.neurologySeizure.count({ where }),
        ]);

        return { seizures, total };
    }

    async findById(id: string) {
        return prisma.neurologySeizure.findUnique({
            where: { id },
            include: neurologySeizureInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        eventTime: string;
        seizureType: SeizureType;
        durationSeconds?: number | null;
        witnessed?: boolean | null;
        witnessedBy?: string | null;
        auraPresent?: boolean | null;
        auraDescription?: string | null;
        lossOfConsciousness?: boolean | null;
        incontinence?: boolean | null;
        tongueBite?: boolean | null;
        postIctalConfusion?: boolean | null;
        postIctalDuration?: number | null;
        triggers?: string | null;
        eegCorrelation?: string | null;
        medicationChange?: string | null;
        injurySustained?: string | null;
        notes?: string | null;
    }) {
        return prisma.neurologySeizure.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                eventTime: new Date(data.eventTime),
                seizureType: data.seizureType,
                durationSeconds: data.durationSeconds ?? undefined,
                witnessed: data.witnessed ?? undefined,
                witnessedBy: data.witnessedBy ?? undefined,
                auraPresent: data.auraPresent ?? undefined,
                auraDescription: data.auraDescription ?? undefined,
                lossOfConsciousness: data.lossOfConsciousness ?? undefined,
                incontinence: data.incontinence ?? undefined,
                tongueBite: data.tongueBite ?? undefined,
                postIctalConfusion: data.postIctalConfusion ?? undefined,
                postIctalDuration: data.postIctalDuration ?? undefined,
                triggers: data.triggers ?? undefined,
                eegCorrelation: data.eegCorrelation ?? undefined,
                medicationChange: data.medicationChange ?? undefined,
                injurySustained: data.injurySustained ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologySeizureInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        eventTime?: string;
        seizureType?: SeizureType;
        durationSeconds?: number | null;
        witnessed?: boolean | null;
        witnessedBy?: string | null;
        auraPresent?: boolean | null;
        auraDescription?: string | null;
        lossOfConsciousness?: boolean | null;
        incontinence?: boolean | null;
        tongueBite?: boolean | null;
        postIctalConfusion?: boolean | null;
        postIctalDuration?: number | null;
        triggers?: string | null;
        eegCorrelation?: string | null;
        medicationChange?: string | null;
        injurySustained?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologySeizureUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            seizureType: data.seizureType,
            durationSeconds: data.durationSeconds ?? undefined,
            witnessed: data.witnessed ?? undefined,
            witnessedBy: data.witnessedBy ?? undefined,
            auraPresent: data.auraPresent ?? undefined,
            auraDescription: data.auraDescription ?? undefined,
            lossOfConsciousness: data.lossOfConsciousness ?? undefined,
            incontinence: data.incontinence ?? undefined,
            tongueBite: data.tongueBite ?? undefined,
            postIctalConfusion: data.postIctalConfusion ?? undefined,
            postIctalDuration: data.postIctalDuration ?? undefined,
            triggers: data.triggers ?? undefined,
            eegCorrelation: data.eegCorrelation ?? undefined,
            medicationChange: data.medicationChange ?? undefined,
            injurySustained: data.injurySustained ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.eventTime) {
            updateData.eventTime = new Date(data.eventTime);
        }

        return prisma.neurologySeizure.update({
            where: { id },
            data: updateData,
            include: neurologySeizureInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologySeizure.delete({
            where: { id },
        });
    }
}

export const neurologySeizureService = new NeurologySeizureService();
