import { MedicationAdministrationStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const medicationAdministrationInclude = {
    medicationOrder: {
        select: {
            id: true,
            medicationName: true,
            dose: true,
            route: true,
            frequency: true,
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
    administeredBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    },
};

export class MedicationAdministrationService {
    async list(options: {
        page: number;
        limit: number;
        status?: MedicationAdministrationStatus;
        patientId?: string;
        medicationOrderId?: string;
        administeredById?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            status,
            patientId,
            medicationOrderId,
            administeredById,
            startDate,
            endDate,
            sortBy = 'administeredAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.MedicationAdministrationWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (medicationOrderId) where.medicationOrderId = medicationOrderId;
        if (administeredById) where.administeredById = administeredById;

        if (startDate || endDate) {
            where.administeredAt = {};
            if (startDate) where.administeredAt.gte = new Date(startDate);
            if (endDate) where.administeredAt.lte = new Date(endDate);
        }

        const [administrations, total] = await Promise.all([
            prisma.medicationAdministration.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: medicationAdministrationInclude,
            }),
            prisma.medicationAdministration.count({ where }),
        ]);

        return { administrations, total };
    }

    async findById(id: string) {
        return prisma.medicationAdministration.findUnique({
            where: { id },
            include: medicationAdministrationInclude,
        });
    }

    async create(data: {
        medicationOrderId: string;
        patientId: string;
        administeredById?: string | null;
        administeredAt?: string | null;
        doseGiven?: string | null;
        status?: MedicationAdministrationStatus;
        notes?: string | null;
    }) {
        return prisma.medicationAdministration.create({
            data: {
                medicationOrderId: data.medicationOrderId,
                patientId: data.patientId,
                administeredById: data.administeredById || undefined,
                administeredAt: data.administeredAt ? new Date(data.administeredAt) : undefined,
                doseGiven: data.doseGiven ?? undefined,
                status: data.status,
                notes: data.notes ?? undefined,
            },
            include: medicationAdministrationInclude,
        });
    }

    async update(id: string, data: {
        medicationOrderId?: string;
        patientId?: string;
        administeredById?: string | null;
        administeredAt?: string | null;
        doseGiven?: string | null;
        status?: MedicationAdministrationStatus;
        notes?: string | null;
    }) {
        const updateData: Prisma.MedicationAdministrationUpdateInput = {
            medicationOrderId: data.medicationOrderId,
            patientId: data.patientId,
            administeredById: data.administeredById ?? undefined,
            doseGiven: data.doseGiven ?? undefined,
            status: data.status,
            notes: data.notes ?? undefined,
        };

        if (data.administeredAt) {
            updateData.administeredAt = new Date(data.administeredAt);
        }

        return prisma.medicationAdministration.update({
            where: { id },
            data: updateData,
            include: medicationAdministrationInclude,
        });
    }

    async delete(id: string) {
        return prisma.medicationAdministration.delete({
            where: { id },
        });
    }
}

export const medicationAdministrationService = new MedicationAdministrationService();
