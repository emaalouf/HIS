import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyLabInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
        },
    },
};

export class CardiologyLabService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
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
            startDate,
            endDate,
            sortBy = 'collectedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyLabResultWhereInput = {};

        if (patientId) where.patientId = patientId;

        if (startDate || endDate) {
            where.collectedAt = {};
            if (startDate) where.collectedAt.gte = new Date(startDate);
            if (endDate) where.collectedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { notes: { contains: search } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.cardiologyLabResult.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyLabInclude,
            }),
            prisma.cardiologyLabResult.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.cardiologyLabResult.findUnique({
            where: { id },
            include: cardiologyLabInclude,
        });
    }

    async create(data: {
        patientId: string;
        collectedAt: string;
        troponin?: number;
        bnp?: number;
        ntProBnp?: number;
        ckmb?: number;
        totalCholesterol?: number;
        ldl?: number;
        hdl?: number;
        triglycerides?: number;
        crp?: number;
        inr?: number;
        notes?: string | null;
    }) {
        return prisma.cardiologyLabResult.create({
            data: {
                patientId: data.patientId,
                collectedAt: new Date(data.collectedAt),
                troponin: data.troponin,
                bnp: data.bnp,
                ntProBnp: data.ntProBnp,
                ckmb: data.ckmb,
                totalCholesterol: data.totalCholesterol,
                ldl: data.ldl,
                hdl: data.hdl,
                triglycerides: data.triglycerides,
                crp: data.crp,
                inr: data.inr,
                notes: data.notes ?? undefined,
            },
            include: cardiologyLabInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        collectedAt?: string;
        troponin?: number;
        bnp?: number;
        ntProBnp?: number;
        ckmb?: number;
        totalCholesterol?: number;
        ldl?: number;
        hdl?: number;
        triglycerides?: number;
        crp?: number;
        inr?: number;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyLabResultUncheckedUpdateInput = {
            patientId: data.patientId,
            troponin: data.troponin,
            bnp: data.bnp,
            ntProBnp: data.ntProBnp,
            ckmb: data.ckmb,
            totalCholesterol: data.totalCholesterol,
            ldl: data.ldl,
            hdl: data.hdl,
            triglycerides: data.triglycerides,
            crp: data.crp,
            inr: data.inr,
            notes: data.notes ?? undefined,
        };

        if (data.collectedAt) {
            updateData.collectedAt = new Date(data.collectedAt);
        }

        return prisma.cardiologyLabResult.update({
            where: { id },
            data: updateData,
            include: cardiologyLabInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyLabResult.delete({
            where: { id },
        });
    }
}

export const cardiologyLabService = new CardiologyLabService();
