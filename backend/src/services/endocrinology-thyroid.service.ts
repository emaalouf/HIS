import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const thyroidInclude = {
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

export class EndocrinologyThyroidService {
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

        const where: Prisma.EndoThyroidWhereInput = {};

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
                { diagnosis: { contains: search } },
                { medication: { contains: search } },
            ];
        }

        const [tests, total] = await Promise.all([
            prisma.endoThyroid.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: thyroidInclude,
            }),
            prisma.endoThyroid.count({ where }),
        ]);

        return { tests, total };
    }

    async findById(id: string) {
        return prisma.endoThyroid.findUnique({
            where: { id },
            include: thyroidInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        testDate: string;
        tsh?: number | null;
        freeT3?: number | null;
        freeT4?: number | null;
        totalT3?: number | null;
        totalT4?: number | null;
        tpoAntibodies?: number | null;
        tgAntibodies?: number | null;
        thyroglobulin?: number | null;
        calcitonin?: number | null;
        diagnosis?: string | null;
        thyroidSize?: string | null;
        nodulesPresent?: boolean;
        noduleDescription?: string | null;
        biopsyRecommended?: boolean;
        biopsyResults?: string | null;
        medication?: string | null;
        dose?: string | null;
        targetTsh?: number | null;
        symptoms?: string | null;
        followUpNeeded?: boolean;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.endoThyroid.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                testDate: new Date(data.testDate),
                tsh: data.tsh ?? undefined,
                freeT3: data.freeT3 ?? undefined,
                freeT4: data.freeT4 ?? undefined,
                totalT3: data.totalT3 ?? undefined,
                totalT4: data.totalT4 ?? undefined,
                tpoAntibodies: data.tpoAntibodies ?? undefined,
                tgAntibodies: data.tgAntibodies ?? undefined,
                thyroglobulin: data.thyroglobulin ?? undefined,
                calcitonin: data.calcitonin ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                thyroidSize: data.thyroidSize ?? undefined,
                nodulesPresent: data.nodulesPresent,
                noduleDescription: data.noduleDescription ?? undefined,
                biopsyRecommended: data.biopsyRecommended,
                biopsyResults: data.biopsyResults ?? undefined,
                medication: data.medication ?? undefined,
                dose: data.dose ?? undefined,
                targetTsh: data.targetTsh ?? undefined,
                symptoms: data.symptoms ?? undefined,
                followUpNeeded: data.followUpNeeded,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: thyroidInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        testDate?: string;
        tsh?: number | null;
        freeT3?: number | null;
        freeT4?: number | null;
        totalT3?: number | null;
        totalT4?: number | null;
        tpoAntibodies?: number | null;
        tgAntibodies?: number | null;
        thyroglobulin?: number | null;
        calcitonin?: number | null;
        diagnosis?: string | null;
        thyroidSize?: string | null;
        nodulesPresent?: boolean;
        noduleDescription?: string | null;
        biopsyRecommended?: boolean;
        biopsyResults?: string | null;
        medication?: string | null;
        dose?: string | null;
        targetTsh?: number | null;
        symptoms?: string | null;
        followUpNeeded?: boolean;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.EndoThyroidUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            tsh: data.tsh ?? undefined,
            freeT3: data.freeT3 ?? undefined,
            freeT4: data.freeT4 ?? undefined,
            totalT3: data.totalT3 ?? undefined,
            totalT4: data.totalT4 ?? undefined,
            tpoAntibodies: data.tpoAntibodies ?? undefined,
            tgAntibodies: data.tgAntibodies ?? undefined,
            thyroglobulin: data.thyroglobulin ?? undefined,
            calcitonin: data.calcitonin ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            thyroidSize: data.thyroidSize ?? undefined,
            nodulesPresent: data.nodulesPresent,
            noduleDescription: data.noduleDescription ?? undefined,
            biopsyRecommended: data.biopsyRecommended,
            biopsyResults: data.biopsyResults ?? undefined,
            medication: data.medication ?? undefined,
            dose: data.dose ?? undefined,
            targetTsh: data.targetTsh ?? undefined,
            symptoms: data.symptoms ?? undefined,
            followUpNeeded: data.followUpNeeded,
            notes: data.notes ?? undefined,
        };

        if (data.testDate) {
            updateData.testDate = new Date(data.testDate);
        }
        if (data.followUpDate) {
            updateData.followUpDate = new Date(data.followUpDate);
        }

        return prisma.endoThyroid.update({
            where: { id },
            data: updateData,
            include: thyroidInclude,
        });
    }

    async delete(id: string) {
        return prisma.endoThyroid.delete({
            where: { id },
        });
    }
}

export const endocrinologyThyroidService = new EndocrinologyThyroidService();
