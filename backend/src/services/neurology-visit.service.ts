import { NeurologyVisitStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyVisitInclude = {
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

export class NeurologyVisitService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: NeurologyVisitStatus;
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
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'visitDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologyVisitWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

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
            prisma.neurologyVisit.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyVisitInclude,
            }),
            prisma.neurologyVisit.count({ where }),
        ]);

        return { visits, total };
    }

    async findById(id: string) {
        return prisma.neurologyVisit.findUnique({
            where: { id },
            include: neurologyVisitInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        status?: NeurologyVisitStatus;
        visitDate: string;
        reason?: string | null;
        symptoms?: string | null;
        mentalStatus?: string | null;
        cranialNerves?: string | null;
        motorExam?: string | null;
        sensoryExam?: string | null;
        reflexes?: string | null;
        coordination?: string | null;
        gait?: string | null;
        speech?: string | null;
        nihssScore?: number | null;
        gcsScore?: number | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        return prisma.neurologyVisit.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                status: data.status,
                visitDate: new Date(data.visitDate),
                reason: data.reason ?? undefined,
                symptoms: data.symptoms ?? undefined,
                mentalStatus: data.mentalStatus ?? undefined,
                cranialNerves: data.cranialNerves ?? undefined,
                motorExam: data.motorExam ?? undefined,
                sensoryExam: data.sensoryExam ?? undefined,
                reflexes: data.reflexes ?? undefined,
                coordination: data.coordination ?? undefined,
                gait: data.gait ?? undefined,
                speech: data.speech ?? undefined,
                nihssScore: data.nihssScore ?? undefined,
                gcsScore: data.gcsScore ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                assessment: data.assessment ?? undefined,
                plan: data.plan ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyVisitInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        status?: NeurologyVisitStatus;
        visitDate?: string;
        reason?: string | null;
        symptoms?: string | null;
        mentalStatus?: string | null;
        cranialNerves?: string | null;
        motorExam?: string | null;
        sensoryExam?: string | null;
        reflexes?: string | null;
        coordination?: string | null;
        gait?: string | null;
        speech?: string | null;
        nihssScore?: number | null;
        gcsScore?: number | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyVisitUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            status: data.status,
            reason: data.reason ?? undefined,
            symptoms: data.symptoms ?? undefined,
            mentalStatus: data.mentalStatus ?? undefined,
            cranialNerves: data.cranialNerves ?? undefined,
            motorExam: data.motorExam ?? undefined,
            sensoryExam: data.sensoryExam ?? undefined,
            reflexes: data.reflexes ?? undefined,
            coordination: data.coordination ?? undefined,
            gait: data.gait ?? undefined,
            speech: data.speech ?? undefined,
            nihssScore: data.nihssScore ?? undefined,
            gcsScore: data.gcsScore ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.visitDate) {
            updateData.visitDate = new Date(data.visitDate);
        }

        return prisma.neurologyVisit.update({
            where: { id },
            data: updateData,
            include: neurologyVisitInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyVisit.delete({
            where: { id },
        });
    }
}

export const neurologyVisitService = new NeurologyVisitService();
