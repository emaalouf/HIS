import { AppointmentStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const appointmentInclude = {
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
    visitType: {
        select: {
            id: true,
            name: true,
            durationMinutes: true,
            isTelehealth: true,
            color: true,
        },
    },
    location: {
        select: {
            id: true,
            name: true,
            type: true,
        },
    },
};

export class AppointmentService {
    async list(options: {
        page: number;
        limit: number;
        providerId?: string;
        patientId?: string;
        status?: AppointmentStatus;
        startDate?: string;
        endDate?: string;
        search?: string;
    }) {
        const { page, limit, providerId, patientId, status, startDate, endDate, search } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.AppointmentWhereInput = {};

        if (providerId) where.providerId = providerId;
        if (patientId) where.patientId = patientId;
        if (status) where.status = status;

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate);
            if (endDate) where.startTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { patient: { phone: { contains: search } } },
            ];
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startTime: 'asc' },
                include: appointmentInclude,
            }),
            prisma.appointment.count({ where }),
        ]);

        return { appointments, total };
    }

    async findById(id: string) {
        return prisma.appointment.findUnique({
            where: { id },
            include: appointmentInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        visitTypeId?: string | null;
        locationId?: string | null;
        startTime: string;
        endTime: string;
        reason?: string | null;
        notes?: string | null;
    }, createdById: string) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (end <= start) {
            throw new Error('End time must be after start time');
        }

        return prisma.appointment.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                visitTypeId: data.visitTypeId || undefined,
                locationId: data.locationId || undefined,
                startTime: start,
                endTime: end,
                reason: data.reason,
                notes: data.notes,
                createdById,
            },
            include: appointmentInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        visitTypeId?: string | null;
        locationId?: string | null;
        startTime?: string;
        endTime?: string;
        reason?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.AppointmentUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            visitTypeId: data.visitTypeId || undefined,
            locationId: data.locationId || undefined,
            reason: data.reason,
            notes: data.notes,
        };

        if (data.startTime) {
            updateData.startTime = new Date(data.startTime);
        }

        if (data.endTime) {
            updateData.endTime = new Date(data.endTime);
        }

        if (data.startTime && data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
            throw new Error('End time must be after start time');
        }

        return prisma.appointment.update({
            where: { id },
            data: updateData,
            include: appointmentInclude,
        });
    }

    async updateStatus(id: string, status: AppointmentStatus, cancellationReason?: string | null) {
        return prisma.appointment.update({
            where: { id },
            data: {
                status,
                cancellationReason: cancellationReason || null,
            },
            include: appointmentInclude,
        });
    }

    async getVisitTypes() {
        return prisma.visitType.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async getLocations() {
        return prisma.location.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async getProviders() {
        return prisma.user.findMany({
            where: { role: 'DOCTOR', isActive: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
            },
            orderBy: { firstName: 'asc' },
        });
    }
}

export const appointmentService = new AppointmentService();
