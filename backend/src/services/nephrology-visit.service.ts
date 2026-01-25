import { CkdStage, NephrologyVisitStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const nephrologyVisitInclude = {
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

export class NephrologyVisitService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: NephrologyVisitStatus;
        patientId?: string;
        providerId?: string;
        ckdStage?: CkdStage;
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
            providerId,
            ckdStage,
            startDate,
            endDate,
            sortBy = 'visitDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NephrologyVisitWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (ckdStage) where.ckdStage = ckdStage;

        if (startDate || endDate) {
            where.visitDate = {};
            if (startDate) where.visitDate.gte = new Date(startDate);
            if (endDate) where.visitDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { reason: { contains: search } },
                { diagnosis: { contains: search } },
            ];
        }

        const [visits, total] = await Promise.all([
            prisma.nephrologyVisit.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: nephrologyVisitInclude,
            }),
            prisma.nephrologyVisit.count({ where }),
        ]);

        return { visits, total };
    }

    async findById(id: string) {
        return prisma.nephrologyVisit.findUnique({
            where: { id },
            include: nephrologyVisitInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        status?: NephrologyVisitStatus;
        visitDate: string;
        reason?: string | null;
        symptoms?: string | null;
        ckdStage?: CkdStage;
        egfr?: number;
        bpSystolic?: number;
        bpDiastolic?: number;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        return prisma.nephrologyVisit.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                status: data.status,
                visitDate: new Date(data.visitDate),
                reason: data.reason ?? undefined,
                symptoms: data.symptoms ?? undefined,
                ckdStage: data.ckdStage,
                egfr: data.egfr,
                bpSystolic: data.bpSystolic,
                bpDiastolic: data.bpDiastolic,
                diagnosis: data.diagnosis ?? undefined,
                assessment: data.assessment ?? undefined,
                plan: data.plan ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: nephrologyVisitInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        status?: NephrologyVisitStatus;
        visitDate?: string;
        reason?: string | null;
        symptoms?: string | null;
        ckdStage?: CkdStage;
        egfr?: number;
        bpSystolic?: number;
        bpDiastolic?: number;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NephrologyVisitUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            status: data.status,
            reason: data.reason ?? undefined,
            symptoms: data.symptoms ?? undefined,
            ckdStage: data.ckdStage,
            egfr: data.egfr,
            bpSystolic: data.bpSystolic,
            bpDiastolic: data.bpDiastolic,
            diagnosis: data.diagnosis ?? undefined,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.visitDate) {
            updateData.visitDate = new Date(data.visitDate);
        }

        return prisma.nephrologyVisit.update({
            where: { id },
            data: updateData,
            include: nephrologyVisitInclude,
        });
    }

    async delete(id: string) {
        return prisma.nephrologyVisit.delete({
            where: { id },
        });
    }
}

export const nephrologyVisitService = new NephrologyVisitService();
