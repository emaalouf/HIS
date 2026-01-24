import { CardiologyDeviceStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyDeviceInclude = {
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
};

export class CardiologyDeviceService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: CardiologyDeviceStatus;
        patientId?: string;
        providerId?: string;
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
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyDeviceWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (search) {
            where.OR = [
                { deviceType: { contains: search, mode: 'insensitive' } },
                { manufacturer: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [devices, total] = await Promise.all([
            prisma.cardiologyDevice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyDeviceInclude,
            }),
            prisma.cardiologyDevice.count({ where }),
        ]);

        return { devices, total };
    }

    async findById(id: string) {
        return prisma.cardiologyDevice.findUnique({
            where: { id },
            include: cardiologyDeviceInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        deviceType: string;
        manufacturer?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        implantDate?: string;
        status?: CardiologyDeviceStatus;
        lastInterrogationDate?: string;
        nextFollowUpDate?: string;
        batteryStatus?: string | null;
        settings?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyDevice.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                deviceType: data.deviceType,
                manufacturer: data.manufacturer ?? undefined,
                model: data.model ?? undefined,
                serialNumber: data.serialNumber ?? undefined,
                implantDate: data.implantDate ? new Date(data.implantDate) : undefined,
                status: data.status,
                lastInterrogationDate: data.lastInterrogationDate ? new Date(data.lastInterrogationDate) : undefined,
                nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
                batteryStatus: data.batteryStatus ?? undefined,
                settings: data.settings ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyDeviceInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        deviceType?: string;
        manufacturer?: string | null;
        model?: string | null;
        serialNumber?: string | null;
        implantDate?: string;
        status?: CardiologyDeviceStatus;
        lastInterrogationDate?: string;
        nextFollowUpDate?: string;
        batteryStatus?: string | null;
        settings?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyDeviceUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            deviceType: data.deviceType,
            manufacturer: data.manufacturer ?? undefined,
            model: data.model ?? undefined,
            serialNumber: data.serialNumber ?? undefined,
            status: data.status,
            batteryStatus: data.batteryStatus ?? undefined,
            settings: data.settings ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.implantDate) {
            updateData.implantDate = new Date(data.implantDate);
        }

        if (data.lastInterrogationDate) {
            updateData.lastInterrogationDate = new Date(data.lastInterrogationDate);
        }

        if (data.nextFollowUpDate) {
            updateData.nextFollowUpDate = new Date(data.nextFollowUpDate);
        }

        return prisma.cardiologyDevice.update({
            where: { id },
            data: updateData,
            include: cardiologyDeviceInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyDevice.delete({
            where: { id },
        });
    }
}

export const cardiologyDeviceService = new CardiologyDeviceService();
