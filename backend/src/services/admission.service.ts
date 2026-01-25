import { AdmissionStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const admissionInclude = {
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
    ward: {
        select: {
            id: true,
            name: true,
        },
    },
    bed: {
        select: {
            id: true,
            bedLabel: true,
            roomNumber: true,
            status: true,
        },
    },
    department: {
        select: {
            id: true,
            name: true,
        },
    },
};

export class AdmissionService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: AdmissionStatus;
        patientId?: string;
        providerId?: string;
        wardId?: string;
        bedId?: string;
        departmentId?: string;
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
            wardId,
            bedId,
            departmentId,
            startDate,
            endDate,
            sortBy = 'admitDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.AdmissionWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (wardId) where.wardId = wardId;
        if (bedId) where.bedId = bedId;
        if (departmentId) where.departmentId = departmentId;

        if (startDate || endDate) {
            where.admitDate = {};
            if (startDate) where.admitDate.gte = new Date(startDate);
            if (endDate) where.admitDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
                { reason: { contains: search, mode: 'insensitive' } },
                { diagnosis: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [admissions, total] = await Promise.all([
            prisma.admission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: admissionInclude,
            }),
            prisma.admission.count({ where }),
        ]);

        return { admissions, total };
    }

    async findById(id: string) {
        return prisma.admission.findUnique({
            where: { id },
            include: admissionInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        wardId?: string | null;
        bedId?: string | null;
        departmentId?: string | null;
        status?: AdmissionStatus;
        admitDate?: string | null;
        dischargeDate?: string | null;
        reason?: string | null;
        diagnosis?: string | null;
        notes?: string | null;
    }) {
        return prisma.admission.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                wardId: data.wardId || undefined,
                bedId: data.bedId || undefined,
                departmentId: data.departmentId || undefined,
                status: data.status,
                admitDate: data.admitDate ? new Date(data.admitDate) : undefined,
                dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
                reason: data.reason ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: admissionInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        wardId?: string | null;
        bedId?: string | null;
        departmentId?: string | null;
        status?: AdmissionStatus;
        admitDate?: string | null;
        dischargeDate?: string | null;
        reason?: string | null;
        diagnosis?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.AdmissionUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            wardId: data.wardId ?? undefined,
            bedId: data.bedId ?? undefined,
            departmentId: data.departmentId ?? undefined,
            status: data.status,
            reason: data.reason ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.admitDate) {
            updateData.admitDate = new Date(data.admitDate);
        }

        if (data.dischargeDate) {
            updateData.dischargeDate = new Date(data.dischargeDate);
        }

        return prisma.admission.update({
            where: { id },
            data: updateData,
            include: admissionInclude,
        });
    }

    async delete(id: string) {
        return prisma.admission.delete({
            where: { id },
        });
    }
}

export const admissionService = new AdmissionService();
