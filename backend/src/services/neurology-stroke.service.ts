import { StrokeSeverity, StrokeType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const neurologyStrokeInclude = {
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

export class NeurologyStrokeService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        strokeType?: StrokeType;
        severity?: StrokeSeverity;
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
            strokeType,
            severity,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'onsetTime',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.NeurologyStrokeWhereInput = {};

        if (strokeType) where.strokeType = strokeType;
        if (severity) where.severity = severity;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.onsetTime = {};
            if (startDate) where.onsetTime.gte = new Date(startDate);
            if (endDate) where.onsetTime.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { location: { contains: search } },
                { ctFindings: { contains: search } },
                { mriFindings: { contains: search } },
                { complications: { contains: search } },
            ];
        }

        const [strokes, total] = await Promise.all([
            prisma.neurologyStroke.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: neurologyStrokeInclude,
            }),
            prisma.neurologyStroke.count({ where }),
        ]);

        return { strokes, total };
    }

    async findById(id: string) {
        return prisma.neurologyStroke.findUnique({
            where: { id },
            include: neurologyStrokeInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        onsetTime: string;
        arrivalTime?: string | null;
        strokeType: StrokeType;
        severity?: StrokeSeverity | null;
        nihssScore?: number | null;
        nihssDetails?: string | null;
        location?: string | null;
        ctDone?: boolean | null;
        ctTime?: string | null;
        ctFindings?: string | null;
        mriDone?: boolean | null;
        mriTime?: string | null;
        mriFindings?: string | null;
        thrombolysisGiven?: boolean | null;
        thrombolysisTime?: string | null;
        thrombectomyDone?: boolean | null;
        thrombectomyTime?: string | null;
        tpaDose?: number | null;
        bpManagement?: string | null;
        complications?: string | null;
        dischargeNihss?: number | null;
        mrsAtDischarge?: number | null;
        dischargeDisposition?: string | null;
        notes?: string | null;
    }) {
        return prisma.neurologyStroke.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                onsetTime: new Date(data.onsetTime),
                arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : undefined,
                strokeType: data.strokeType,
                severity: data.severity ?? undefined,
                nihssScore: data.nihssScore ?? undefined,
                nihssDetails: data.nihssDetails ?? undefined,
                location: data.location ?? undefined,
                ctDone: data.ctDone ?? undefined,
                ctTime: data.ctTime ? new Date(data.ctTime) : undefined,
                ctFindings: data.ctFindings ?? undefined,
                mriDone: data.mriDone ?? undefined,
                mriTime: data.mriTime ? new Date(data.mriTime) : undefined,
                mriFindings: data.mriFindings ?? undefined,
                thrombolysisGiven: data.thrombolysisGiven ?? undefined,
                thrombolysisTime: data.thrombolysisTime ? new Date(data.thrombolysisTime) : undefined,
                thrombectomyDone: data.thrombectomyDone ?? undefined,
                thrombectomyTime: data.thrombectomyTime ? new Date(data.thrombectomyTime) : undefined,
                tpaDose: data.tpaDose ?? undefined,
                bpManagement: data.bpManagement ?? undefined,
                complications: data.complications ?? undefined,
                dischargeNihss: data.dischargeNihss ?? undefined,
                mrsAtDischarge: data.mrsAtDischarge ?? undefined,
                dischargeDisposition: data.dischargeDisposition ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: neurologyStrokeInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        onsetTime?: string;
        arrivalTime?: string | null;
        strokeType?: StrokeType;
        severity?: StrokeSeverity | null;
        nihssScore?: number | null;
        nihssDetails?: string | null;
        location?: string | null;
        ctDone?: boolean | null;
        ctTime?: string | null;
        ctFindings?: string | null;
        mriDone?: boolean | null;
        mriTime?: string | null;
        mriFindings?: string | null;
        thrombolysisGiven?: boolean | null;
        thrombolysisTime?: string | null;
        thrombectomyDone?: boolean | null;
        thrombectomyTime?: string | null;
        tpaDose?: number | null;
        bpManagement?: string | null;
        complications?: string | null;
        dischargeNihss?: number | null;
        mrsAtDischarge?: number | null;
        dischargeDisposition?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.NeurologyStrokeUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            strokeType: data.strokeType,
            severity: data.severity ?? undefined,
            nihssScore: data.nihssScore ?? undefined,
            nihssDetails: data.nihssDetails ?? undefined,
            location: data.location ?? undefined,
            ctDone: data.ctDone ?? undefined,
            ctFindings: data.ctFindings ?? undefined,
            mriDone: data.mriDone ?? undefined,
            mriFindings: data.mriFindings ?? undefined,
            thrombolysisGiven: data.thrombolysisGiven ?? undefined,
            thrombectomyDone: data.thrombectomyDone ?? undefined,
            tpaDose: data.tpaDose ?? undefined,
            bpManagement: data.bpManagement ?? undefined,
            complications: data.complications ?? undefined,
            dischargeNihss: data.dischargeNihss ?? undefined,
            mrsAtDischarge: data.mrsAtDischarge ?? undefined,
            dischargeDisposition: data.dischargeDisposition ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.onsetTime) {
            updateData.onsetTime = new Date(data.onsetTime);
        }
        if (data.arrivalTime !== undefined) {
            updateData.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;
        }
        if (data.ctTime !== undefined) {
            updateData.ctTime = data.ctTime ? new Date(data.ctTime) : null;
        }
        if (data.mriTime !== undefined) {
            updateData.mriTime = data.mriTime ? new Date(data.mriTime) : null;
        }
        if (data.thrombolysisTime !== undefined) {
            updateData.thrombolysisTime = data.thrombolysisTime ? new Date(data.thrombolysisTime) : null;
        }
        if (data.thrombectomyTime !== undefined) {
            updateData.thrombectomyTime = data.thrombectomyTime ? new Date(data.thrombectomyTime) : null;
        }

        return prisma.neurologyStroke.update({
            where: { id },
            data: updateData,
            include: neurologyStrokeInclude,
        });
    }

    async delete(id: string) {
        return prisma.neurologyStroke.delete({
            where: { id },
        });
    }
}

export const neurologyStrokeService = new NeurologyStrokeService();
