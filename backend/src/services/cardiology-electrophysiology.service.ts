import { CardiologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyElectrophysiologyInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
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
    visit: {
        select: {
            id: true,
            visitDate: true,
        },
    },
};

export class CardiologyElectrophysiologyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: CardiologyTestStatus;
        patientId?: string;
        providerId?: string;
        visitId?: string;
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
            visitId,
            startDate,
            endDate,
            sortBy = 'performedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyElectrophysiologyWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (visitId) where.visitId = visitId;

        if (startDate || endDate) {
            where.performedAt = {};
            if (startDate) where.performedAt.gte = new Date(startDate);
            if (endDate) where.performedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { arrhythmiaType: { contains: search, mode: 'insensitive' } },
                { deviceType: { contains: search, mode: 'insensitive' } },
                { manufacturer: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { ablationTarget: { contains: search, mode: 'insensitive' } },
                { indication: { contains: search, mode: 'insensitive' } },
                { outcome: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [studies, total] = await Promise.all([
            prisma.cardiologyElectrophysiology.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyElectrophysiologyInclude,
            }),
            prisma.cardiologyElectrophysiology.count({ where }),
        ]);

        return { studies, total };
    }

    async findById(id: string) {
        return prisma.cardiologyElectrophysiology.findUnique({
            where: { id },
            include: cardiologyElectrophysiologyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt: string;
        procedureType: string;
        indication?: string | null;
        arrhythmiaType?: string | null;
        deviceType?: string | null;
        manufacturer?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        implantDate?: string | null;
        ablationTarget?: string | null;
        fluoroscopyTime?: number;
        complications?: string | null;
        outcome?: string | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyElectrophysiology.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                performedAt: new Date(data.performedAt),
                procedureType: data.procedureType,
                indication: data.indication ?? undefined,
                arrhythmiaType: data.arrhythmiaType ?? undefined,
                deviceType: data.deviceType ?? undefined,
                manufacturer: data.manufacturer ?? undefined,
                model: data.model ?? undefined,
                serialNumber: data.serialNumber ?? undefined,
                implantDate: data.implantDate ? new Date(data.implantDate) : undefined,
                ablationTarget: data.ablationTarget ?? undefined,
                fluoroscopyTime: data.fluoroscopyTime,
                complications: data.complications ?? undefined,
                outcome: data.outcome ?? undefined,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyElectrophysiologyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        performedAt?: string;
        procedureType?: string;
        indication?: string | null;
        arrhythmiaType?: string | null;
        deviceType?: string | null;
        manufacturer?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        implantDate?: string | null;
        ablationTarget?: string | null;
        fluoroscopyTime?: number;
        complications?: string | null;
        outcome?: string | null;
        followUpDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyElectrophysiologyUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            procedureType: data.procedureType,
            indication: data.indication ?? undefined,
            arrhythmiaType: data.arrhythmiaType ?? undefined,
            deviceType: data.deviceType ?? undefined,
            manufacturer: data.manufacturer ?? undefined,
            model: data.model ?? undefined,
            serialNumber: data.serialNumber ?? undefined,
            ablationTarget: data.ablationTarget ?? undefined,
            fluoroscopyTime: data.fluoroscopyTime,
            complications: data.complications ?? undefined,
            outcome: data.outcome ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.performedAt) {
            updateData.performedAt = new Date(data.performedAt);
        }
        if (data.implantDate !== undefined) {
            updateData.implantDate = data.implantDate ? new Date(data.implantDate) : null;
        }
        if (data.followUpDate !== undefined) {
            updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
        }

        return prisma.cardiologyElectrophysiology.update({
            where: { id },
            data: updateData,
            include: cardiologyElectrophysiologyInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyElectrophysiology.delete({
            where: { id },
        });
    }
}

export const cardiologyElectrophysiologyService = new CardiologyElectrophysiologyService();
