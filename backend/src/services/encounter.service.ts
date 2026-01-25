import { EncounterStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const encounterInclude = {
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
    appointment: {
        select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
        },
    },
    admission: {
        select: {
            id: true,
            status: true,
            admitDate: true,
            dischargeDate: true,
        },
    },
};

export class EncounterService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: EncounterStatus;
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
            sortBy = 'startTime',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.EncounterWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate);
            if (endDate) where.startTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { reasonForVisit: { contains: search } },
                { diagnosis: { contains: search } },
            ];
        }

        const [encounters, total] = await Promise.all([
            prisma.encounter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: encounterInclude,
            }),
            prisma.encounter.count({ where }),
        ]);

        return { encounters, total };
    }

    async findById(id: string) {
        return prisma.encounter.findUnique({
            where: { id },
            include: encounterInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        appointmentId?: string | null;
        admissionId?: string | null;
        status?: EncounterStatus;
        reasonForVisit?: string | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        startTime?: string | null;
        endTime?: string | null;
        notes?: string | null;
    }, createdById: string) {
        return prisma.encounter.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                appointmentId: data.appointmentId || undefined,
                admissionId: data.admissionId || undefined,
                status: data.status,
                reasonForVisit: data.reasonForVisit ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                assessment: data.assessment ?? undefined,
                plan: data.plan ?? undefined,
                startTime: data.startTime ? new Date(data.startTime) : undefined,
                endTime: data.endTime ? new Date(data.endTime) : undefined,
                notes: data.notes ?? undefined,
                createdById,
            },
            include: encounterInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        appointmentId?: string | null;
        admissionId?: string | null;
        status?: EncounterStatus;
        reasonForVisit?: string | null;
        diagnosis?: string | null;
        assessment?: string | null;
        plan?: string | null;
        startTime?: string | null;
        endTime?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.EncounterUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            appointmentId: data.appointmentId || undefined,
            admissionId: data.admissionId || undefined,
            status: data.status,
            reasonForVisit: data.reasonForVisit ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.startTime) {
            updateData.startTime = new Date(data.startTime);
        }
        if (data.endTime) {
            updateData.endTime = new Date(data.endTime);
        }

        return prisma.encounter.update({
            where: { id },
            data: updateData,
            include: encounterInclude,
        });
    }

    async delete(id: string) {
        return prisma.encounter.delete({
            where: { id },
        });
    }
}

export const encounterService = new EncounterService();
