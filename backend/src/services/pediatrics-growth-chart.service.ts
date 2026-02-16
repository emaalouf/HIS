import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const pedsGrowthChartInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
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

export class PedsGrowthChartService {
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
            sortBy = 'measurementDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PedsGrowthChartWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.measurementDate = {};
            if (startDate) where.measurementDate.gte = new Date(startDate);
            if (endDate) where.measurementDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { nutritionalStatus: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [measurements, total] = await Promise.all([
            prisma.pedsGrowthChart.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: pedsGrowthChartInclude,
            }),
            prisma.pedsGrowthChart.count({ where }),
        ]);

        return { measurements, total };
    }

    async findById(id: string) {
        return prisma.pedsGrowthChart.findUnique({
            where: { id },
            include: pedsGrowthChartInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        measurementDate: string;
        ageMonths?: number | null;
        weightKg?: number | null;
        heightCm?: number | null;
        headCircumferenceCm?: number | null;
        bmi?: number | null;
        weightPercentile?: number | null;
        heightPercentile?: number | null;
        bmiPercentile?: number | null;
        headCircPercentile?: number | null;
        weightForLength?: number | null;
        growthVelocity?: number | null;
        nutritionalStatus?: string | null;
        zScoreWeight?: number | null;
        zScoreHeight?: number | null;
        plotOnWhoChart?: boolean | null;
        plotOnCdcChart?: boolean | null;
        prematureCorrection?: boolean | null;
        weeksPremature?: number | null;
        notes?: string | null;
    }) {
        return prisma.pedsGrowthChart.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                measurementDate: new Date(data.measurementDate),
                ageMonths: data.ageMonths ?? undefined,
                weightKg: data.weightKg ?? undefined,
                heightCm: data.heightCm ?? undefined,
                headCircumferenceCm: data.headCircumferenceCm ?? undefined,
                bmi: data.bmi ?? undefined,
                weightPercentile: data.weightPercentile ?? undefined,
                heightPercentile: data.heightPercentile ?? undefined,
                bmiPercentile: data.bmiPercentile ?? undefined,
                headCircPercentile: data.headCircPercentile ?? undefined,
                weightForLength: data.weightForLength ?? undefined,
                growthVelocity: data.growthVelocity ?? undefined,
                nutritionalStatus: data.nutritionalStatus ?? undefined,
                zScoreWeight: data.zScoreWeight ?? undefined,
                zScoreHeight: data.zScoreHeight ?? undefined,
                plotOnWhoChart: data.plotOnWhoChart ?? undefined,
                plotOnCdcChart: data.plotOnCdcChart ?? undefined,
                prematureCorrection: data.prematureCorrection ?? undefined,
                weeksPremature: data.weeksPremature ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: pedsGrowthChartInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        measurementDate?: string;
        ageMonths?: number | null;
        weightKg?: number | null;
        heightCm?: number | null;
        headCircumferenceCm?: number | null;
        bmi?: number | null;
        weightPercentile?: number | null;
        heightPercentile?: number | null;
        bmiPercentile?: number | null;
        headCircPercentile?: number | null;
        weightForLength?: number | null;
        growthVelocity?: number | null;
        nutritionalStatus?: string | null;
        zScoreWeight?: number | null;
        zScoreHeight?: number | null;
        plotOnWhoChart?: boolean | null;
        plotOnCdcChart?: boolean | null;
        prematureCorrection?: boolean | null;
        weeksPremature?: number | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PedsGrowthChartUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            ageMonths: data.ageMonths ?? undefined,
            weightKg: data.weightKg ?? undefined,
            heightCm: data.heightCm ?? undefined,
            headCircumferenceCm: data.headCircumferenceCm ?? undefined,
            bmi: data.bmi ?? undefined,
            weightPercentile: data.weightPercentile ?? undefined,
            heightPercentile: data.heightPercentile ?? undefined,
            bmiPercentile: data.bmiPercentile ?? undefined,
            headCircPercentile: data.headCircPercentile ?? undefined,
            weightForLength: data.weightForLength ?? undefined,
            growthVelocity: data.growthVelocity ?? undefined,
            nutritionalStatus: data.nutritionalStatus ?? undefined,
            zScoreWeight: data.zScoreWeight ?? undefined,
            zScoreHeight: data.zScoreHeight ?? undefined,
            plotOnWhoChart: data.plotOnWhoChart ?? undefined,
            plotOnCdcChart: data.plotOnCdcChart ?? undefined,
            prematureCorrection: data.prematureCorrection ?? undefined,
            weeksPremature: data.weeksPremature ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.measurementDate) {
            updateData.measurementDate = new Date(data.measurementDate);
        }

        return prisma.pedsGrowthChart.update({
            where: { id },
            data: updateData,
            include: pedsGrowthChartInclude,
        });
    }

    async delete(id: string) {
        return prisma.pedsGrowthChart.delete({
            where: { id },
        });
    }
}

export const pedsGrowthChartService = new PedsGrowthChartService();
