import { FractureStatus, FractureType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const orthopedicFractureInclude = {
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

export class OrthopedicFractureService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: FractureStatus;
        fractureType?: FractureType;
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
            status,
            fractureType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'injuryDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OrthopedicFractureWhereInput = {};

        if (status) where.status = status;
        if (fractureType) where.fractureType = fractureType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.injuryDate = {};
            if (startDate) where.injuryDate.gte = new Date(startDate);
            if (endDate) where.injuryDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { bone: { contains: search } },
                { location: { contains: search } },
                { classification: { contains: search } },
            ];
        }

        const [fractures, total] = await Promise.all([
            prisma.orthopedicFracture.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: orthopedicFractureInclude,
            }),
            prisma.orthopedicFracture.count({ where }),
        ]);

        return { fractures, total };
    }

    async findById(id: string) {
        return prisma.orthopedicFracture.findUnique({
            where: { id },
            include: orthopedicFractureInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        injuryDate: string;
        fractureType: FractureType;
        bone: string;
        location?: string | null;
        classification?: string | null;
        displacement?: string | null;
        angulation?: string | null;
        comminution?: string | null;
        status?: FractureStatus;
        reductionPerformed?: boolean;
        reductionDate?: string | null;
        fixationType?: string | null;
        implantUsed?: string | null;
        surgeryDate?: string | null;
        complications?: string | null;
        healingProgress?: string | null;
        followUpXrayDate?: string | null;
        weightBearingStatus?: string | null;
        physicalTherapyStarted?: boolean;
        notes?: string | null;
    }) {
        return prisma.orthopedicFracture.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                injuryDate: new Date(data.injuryDate),
                fractureType: data.fractureType,
                bone: data.bone,
                location: data.location ?? undefined,
                classification: data.classification ?? undefined,
                displacement: data.displacement ?? undefined,
                angulation: data.angulation ?? undefined,
                comminution: data.comminution ?? undefined,
                status: data.status,
                reductionPerformed: data.reductionPerformed,
                reductionDate: data.reductionDate ? new Date(data.reductionDate) : undefined,
                fixationType: data.fixationType ?? undefined,
                implantUsed: data.implantUsed ?? undefined,
                surgeryDate: data.surgeryDate ? new Date(data.surgeryDate) : undefined,
                complications: data.complications ?? undefined,
                healingProgress: data.healingProgress ?? undefined,
                followUpXrayDate: data.followUpXrayDate ? new Date(data.followUpXrayDate) : undefined,
                weightBearingStatus: data.weightBearingStatus ?? undefined,
                physicalTherapyStarted: data.physicalTherapyStarted,
                notes: data.notes ?? undefined,
            },
            include: orthopedicFractureInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        injuryDate?: string;
        fractureType?: FractureType;
        bone?: string;
        location?: string | null;
        classification?: string | null;
        displacement?: string | null;
        angulation?: string | null;
        comminution?: string | null;
        status?: FractureStatus;
        reductionPerformed?: boolean;
        reductionDate?: string | null;
        fixationType?: string | null;
        implantUsed?: string | null;
        surgeryDate?: string | null;
        complications?: string | null;
        healingProgress?: string | null;
        followUpXrayDate?: string | null;
        weightBearingStatus?: string | null;
        physicalTherapyStarted?: boolean;
        notes?: string | null;
    }) {
        const updateData: Prisma.OrthopedicFractureUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            fractureType: data.fractureType,
            bone: data.bone,
            location: data.location ?? undefined,
            classification: data.classification ?? undefined,
            displacement: data.displacement ?? undefined,
            angulation: data.angulation ?? undefined,
            comminution: data.comminution ?? undefined,
            status: data.status,
            reductionPerformed: data.reductionPerformed,
            fixationType: data.fixationType ?? undefined,
            implantUsed: data.implantUsed ?? undefined,
            complications: data.complications ?? undefined,
            healingProgress: data.healingProgress ?? undefined,
            weightBearingStatus: data.weightBearingStatus ?? undefined,
            physicalTherapyStarted: data.physicalTherapyStarted,
            notes: data.notes ?? undefined,
        };

        if (data.injuryDate) {
            updateData.injuryDate = new Date(data.injuryDate);
        }
        if (data.reductionDate) {
            updateData.reductionDate = new Date(data.reductionDate);
        }
        if (data.surgeryDate) {
            updateData.surgeryDate = new Date(data.surgeryDate);
        }
        if (data.followUpXrayDate) {
            updateData.followUpXrayDate = new Date(data.followUpXrayDate);
        }

        return prisma.orthopedicFracture.update({
            where: { id },
            data: updateData,
            include: orthopedicFractureInclude,
        });
    }

    async delete(id: string) {
        return prisma.orthopedicFracture.delete({
            where: { id },
        });
    }
}

export const orthopedicFractureService = new OrthopedicFractureService();
