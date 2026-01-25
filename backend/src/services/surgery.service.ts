import { SurgeryStatus, SurgeryPriority, Prisma } from '@prisma/client';
import prisma from '../config/database';

const surgeryInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
    admission: {
        select: {
            id: true,
            admitDate: true,
            reason: true,
            diagnosis: true,
        },
    },
    theater: {
        select: {
            id: true,
            name: true,
            location: true,
        },
    },
    teamMembers: {
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    specialty: true,
                },
            },
        },
    },
    checklists: {
        include: {
            completedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: { completedAt: 'desc' },
    },
    anesthesiaRecord: true,
    operativeReport: {
        include: {
            surgeon: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    },
};

export class SurgeryService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: SurgeryStatus;
        priority?: SurgeryPriority;
        patientId?: string;
        theaterId?: string;
        admissionId?: string;
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
            priority,
            patientId,
            theaterId,
            admissionId,
            startDate,
            endDate,
            sortBy = 'scheduledStart',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.SurgeryWhereInput = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (patientId) where.patientId = patientId;
        if (theaterId) where.theaterId = theaterId;
        if (admissionId) where.admissionId = admissionId;

        if (startDate || endDate) {
            where.scheduledStart = {};
            if (startDate) where.scheduledStart.gte = new Date(startDate);
            if (endDate) where.scheduledStart.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { procedureName: { contains: search, mode: 'insensitive' } },
                { preOpDiagnosis: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [surgeries, total] = await Promise.all([
            prisma.surgery.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: surgeryInclude,
            }),
            prisma.surgery.count({ where }),
        ]);

        return { surgeries, total };
    }

    async findById(id: string) {
        return prisma.surgery.findUnique({
            where: { id },
            include: surgeryInclude,
        });
    }

    async create(data: {
        patientId: string;
        admissionId?: string | null;
        theaterId?: string | null;
        status?: SurgeryStatus;
        priority?: SurgeryPriority;
        scheduledStart: string;
        scheduledEnd: string;
        preOpDiagnosis: string;
        postOpDiagnosis?: string | null;
        procedureName: string;
    }) {
        return prisma.surgery.create({
            data: {
                patientId: data.patientId,
                admissionId: data.admissionId ?? undefined,
                theaterId: data.theaterId ?? undefined,
                status: data.status ?? SurgeryStatus.REQUESTED,
                priority: data.priority ?? SurgeryPriority.ELECTIVE,
                scheduledStart: new Date(data.scheduledStart),
                scheduledEnd: new Date(data.scheduledEnd),
                preOpDiagnosis: data.preOpDiagnosis,
                postOpDiagnosis: data.postOpDiagnosis ?? undefined,
                procedureName: data.procedureName,
            },
            include: surgeryInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        admissionId?: string | null;
        theaterId?: string | null;
        status?: SurgeryStatus;
        priority?: SurgeryPriority;
        scheduledStart?: string;
        scheduledEnd?: string;
        actualStart?: string | null;
        actualEnd?: string | null;
        preOpDiagnosis?: string;
        postOpDiagnosis?: string | null;
        procedureName?: string;
    }) {
        const updateData: Prisma.SurgeryUpdateInput = {
            patientId: data.patientId,
            admissionId: data.admissionId ?? undefined,
            theaterId: data.theaterId ?? undefined,
            status: data.status,
            priority: data.priority,
            preOpDiagnosis: data.preOpDiagnosis,
            postOpDiagnosis: data.postOpDiagnosis ?? undefined,
            procedureName: data.procedureName,
        };

        if (data.scheduledStart) {
            updateData.scheduledStart = new Date(data.scheduledStart);
        }

        if (data.scheduledEnd) {
            updateData.scheduledEnd = new Date(data.scheduledEnd);
        }

        if (data.actualStart) {
            updateData.actualStart = new Date(data.actualStart);
        } else if (data.actualStart === null) {
            updateData.actualStart = null;
        }

        if (data.actualEnd) {
            updateData.actualEnd = new Date(data.actualEnd);
        } else if (data.actualEnd === null) {
            updateData.actualEnd = null;
        }

        return prisma.surgery.update({
            where: { id },
            data: updateData,
            include: surgeryInclude,
        });
    }

    async updateStatus(id: string, status: SurgeryStatus, actualStart?: string | null, actualEnd?: string | null) {
        const updateData: Prisma.SurgeryUpdateInput = {
            status,
        };

        if (actualStart) {
            updateData.actualStart = new Date(actualStart);
        } else if (actualStart === null) {
            updateData.actualStart = null;
        }

        if (actualEnd) {
            updateData.actualEnd = new Date(actualEnd);
        } else if (actualEnd === null) {
            updateData.actualEnd = null;
        }

        return prisma.surgery.update({
            where: { id },
            data: updateData,
            include: surgeryInclude,
        });
    }

    async addTeamMember(data: {
        surgeryId: string;
        userId: string;
        role: string;
        notes?: string | null;
    }) {
        return prisma.surgeryTeamMember.create({
            data: {
                surgeryId: data.surgeryId,
                userId: data.userId,
                role: data.role as any,
                notes: data.notes ?? undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        specialty: true,
                    },
                },
            },
        });
    }

    async removeTeamMember(surgeryId: string, userId: string, role: string) {
        return prisma.surgeryTeamMember.deleteMany({
            where: {
                surgeryId,
                userId,
                role: role as any,
            },
        });
    }

    async delete(id: string) {
        return prisma.surgery.delete({
            where: { id },
        });
    }
}

export const surgeryService = new SurgeryService();