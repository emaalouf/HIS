import { CardiologyTestStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const cardiologyHeartFailureInclude = {
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

export class CardiologyHeartFailureService {
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
        nyhaClass?: string;
        heartFailureStage?: string;
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
            nyhaClass,
            heartFailureStage,
            sortBy = 'assessmentDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.CardiologyHeartFailureWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (visitId) where.visitId = visitId;
        if (nyhaClass) where.nyhaClass = nyhaClass;
        if (heartFailureStage) where.heartFailureStage = heartFailureStage;

        if (startDate || endDate) {
            where.assessmentDate = {};
            if (startDate) where.assessmentDate.gte = new Date(startDate);
            if (endDate) where.assessmentDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { etiology: { contains: search, mode: 'insensitive' } },
                { symptoms: { contains: search, mode: 'insensitive' } },
                { medications: { contains: search, mode: 'insensitive' } },
                { mechanicalSupport: { contains: search, mode: 'insensitive' } },
                { assessment: { contains: search, mode: 'insensitive' } },
                { plan: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
                { provider: { firstName: { contains: search, mode: 'insensitive' } } },
                { provider: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [assessments, total] = await Promise.all([
            prisma.cardiologyHeartFailure.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: cardiologyHeartFailureInclude,
            }),
            prisma.cardiologyHeartFailure.count({ where }),
        ]);

        return { assessments, total };
    }

    async findById(id: string) {
        return prisma.cardiologyHeartFailure.findUnique({
            where: { id },
            include: cardiologyHeartFailureInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        assessmentDate: string;
        etiology?: string | null;
        nyhaClass?: string | null;
        heartFailureStage?: string | null;
        lvef?: number;
        symptoms?: string | null;
        medications?: string | null;
        mechanicalSupport?: string | null;
        transplantStatus?: string | null;
        implantableDevices?: string | null;
        rehospitalizations?: number;
        lastHospitalization?: string | null;
        bnp?: number;
        ntProBnp?: number;
        assessment?: string | null;
        plan?: string | null;
        nextFollowUpDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.cardiologyHeartFailure.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId ?? undefined,
                visitId: data.visitId ?? undefined,
                status: data.status,
                assessmentDate: new Date(data.assessmentDate),
                etiology: data.etiology ?? undefined,
                nyhaClass: data.nyhaClass ?? undefined,
                heartFailureStage: data.heartFailureStage ?? undefined,
                lvef: data.lvef,
                symptoms: data.symptoms ?? undefined,
                medications: data.medications ?? undefined,
                mechanicalSupport: data.mechanicalSupport ?? undefined,
                transplantStatus: data.transplantStatus ?? undefined,
                implantableDevices: data.implantableDevices ?? undefined,
                rehospitalizations: data.rehospitalizations,
                lastHospitalization: data.lastHospitalization ? new Date(data.lastHospitalization) : undefined,
                bnp: data.bnp,
                ntProBnp: data.ntProBnp,
                assessment: data.assessment ?? undefined,
                plan: data.plan ?? undefined,
                nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: cardiologyHeartFailureInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string | null;
        visitId?: string | null;
        status?: CardiologyTestStatus;
        assessmentDate?: string;
        etiology?: string | null;
        nyhaClass?: string | null;
        heartFailureStage?: string | null;
        lvef?: number;
        symptoms?: string | null;
        medications?: string | null;
        mechanicalSupport?: string | null;
        transplantStatus?: string | null;
        implantableDevices?: string | null;
        rehospitalizations?: number;
        lastHospitalization?: string | null;
        bnp?: number;
        ntProBnp?: number;
        assessment?: string | null;
        plan?: string | null;
        nextFollowUpDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.CardiologyHeartFailureUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId ?? undefined,
            visitId: data.visitId ?? undefined,
            status: data.status,
            etiology: data.etiology ?? undefined,
            nyhaClass: data.nyhaClass ?? undefined,
            heartFailureStage: data.heartFailureStage ?? undefined,
            lvef: data.lvef,
            symptoms: data.symptoms ?? undefined,
            medications: data.medications ?? undefined,
            mechanicalSupport: data.mechanicalSupport ?? undefined,
            transplantStatus: data.transplantStatus ?? undefined,
            implantableDevices: data.implantableDevices ?? undefined,
            rehospitalizations: data.rehospitalizations,
            bnp: data.bnp,
            ntProBnp: data.ntProBnp,
            assessment: data.assessment ?? undefined,
            plan: data.plan ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.assessmentDate) {
            updateData.assessmentDate = new Date(data.assessmentDate);
        }
        if (data.lastHospitalization !== undefined) {
            updateData.lastHospitalization = data.lastHospitalization ? new Date(data.lastHospitalization) : null;
        }
        if (data.nextFollowUpDate !== undefined) {
            updateData.nextFollowUpDate = data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null;
        }

        return prisma.cardiologyHeartFailure.update({
            where: { id },
            data: updateData,
            include: cardiologyHeartFailureInclude,
        });
    }

    async delete(id: string) {
        return prisma.cardiologyHeartFailure.delete({
            where: { id },
        });
    }
}

export const cardiologyHeartFailureService = new CardiologyHeartFailureService();
