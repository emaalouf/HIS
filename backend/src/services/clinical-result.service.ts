import { ResultFlag, ResultStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const clinicalResultInclude = {
    order: {
        select: {
            id: true,
            orderName: true,
            orderType: true,
            status: true,
        },
    },
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
};

export class ClinicalResultService {
    async list(options: {
        page: number;
        limit: number;
        status?: ResultStatus;
        flag?: ResultFlag;
        patientId?: string;
        orderId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            status,
            flag,
            patientId,
            orderId,
            startDate,
            endDate,
            search,
            sortBy = 'reportedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ClinicalResultWhereInput = {};

        if (status) where.status = status;
        if (flag) where.flag = flag;
        if (patientId) where.patientId = patientId;
        if (orderId) where.orderId = orderId;

        if (startDate || endDate) {
            where.reportedAt = {};
            if (startDate) where.reportedAt.gte = new Date(startDate);
            if (endDate) where.reportedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { resultName: { contains: search, mode: 'insensitive' } },
                { value: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.clinicalResult.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: clinicalResultInclude,
            }),
            prisma.clinicalResult.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.clinicalResult.findUnique({
            where: { id },
            include: clinicalResultInclude,
        });
    }

    async create(data: {
        orderId: string;
        patientId: string;
        reportedAt?: string | null;
        resultName: string;
        value?: string | null;
        unit?: string | null;
        referenceRange?: string | null;
        status?: ResultStatus;
        flag?: ResultFlag;
        notes?: string | null;
    }) {
        return prisma.clinicalResult.create({
            data: {
                orderId: data.orderId,
                patientId: data.patientId,
                reportedAt: data.reportedAt ? new Date(data.reportedAt) : undefined,
                resultName: data.resultName,
                value: data.value ?? undefined,
                unit: data.unit ?? undefined,
                referenceRange: data.referenceRange ?? undefined,
                status: data.status,
                flag: data.flag,
                notes: data.notes ?? undefined,
            },
            include: clinicalResultInclude,
        });
    }

    async update(id: string, data: {
        orderId?: string;
        patientId?: string;
        reportedAt?: string | null;
        resultName?: string;
        value?: string | null;
        unit?: string | null;
        referenceRange?: string | null;
        status?: ResultStatus;
        flag?: ResultFlag;
        notes?: string | null;
    }) {
        const updateData: Prisma.ClinicalResultUpdateInput = {
            orderId: data.orderId,
            patientId: data.patientId,
            resultName: data.resultName,
            value: data.value ?? undefined,
            unit: data.unit ?? undefined,
            referenceRange: data.referenceRange ?? undefined,
            status: data.status,
            flag: data.flag,
            notes: data.notes ?? undefined,
        };

        if (data.reportedAt) {
            updateData.reportedAt = new Date(data.reportedAt);
        }

        return prisma.clinicalResult.update({
            where: { id },
            data: updateData,
            include: clinicalResultInclude,
        });
    }

    async delete(id: string) {
        return prisma.clinicalResult.delete({
            where: { id },
        });
    }
}

export const clinicalResultService = new ClinicalResultService();
