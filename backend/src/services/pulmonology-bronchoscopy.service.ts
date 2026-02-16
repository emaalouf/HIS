import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const bronchoscopyInclude = {
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

export class PulmonologyBronchoscopyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
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
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'procedureDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PulmonologyBronchoscopyWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.procedureDate = {};
            if (startDate) where.procedureDate.gte = new Date(startDate);
            if (endDate) where.procedureDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { indication: { contains: search } },
                { abnormalities: { contains: search } },
            ];
        }

        const [procedures, total] = await Promise.all([
            prisma.pulmonologyBronchoscopy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: bronchoscopyInclude,
            }),
            prisma.pulmonologyBronchoscopy.count({ where }),
        ]);

        return { procedures, total };
    }

    async findById(id: string) {
        return prisma.pulmonologyBronchoscopy.findUnique({
            where: { id },
            include: bronchoscopyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        procedureDate: string;
        indication: string;
        anesthesia?: string | null;
        vocalCords?: string | null;
        trachea?: string | null;
        carina?: string | null;
        rightMainBronchus?: string | null;
        leftMainBronchus?: string | null;
        lobarBranches?: string | null;
        segmentalBranches?: string | null;
        abnormalitiesFound?: boolean;
        abnormalities?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        balfPerformed?: boolean;
        balSites?: string | null;
        balResults?: string | null;
        brushingsTaken?: boolean;
        complications?: string | null;
        postOpInstructions?: string | null;
        notes?: string | null;
    }) {
        return prisma.pulmonologyBronchoscopy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                procedureDate: new Date(data.procedureDate),
                indication: data.indication,
                anesthesia: data.anesthesia ?? undefined,
                vocalCords: data.vocalCords ?? undefined,
                trachea: data.trachea ?? undefined,
                carina: data.carina ?? undefined,
                rightMainBronchus: data.rightMainBronchus ?? undefined,
                leftMainBronchus: data.leftMainBronchus ?? undefined,
                lobarBranches: data.lobarBranches ?? undefined,
                segmentalBranches: data.segmentalBranches ?? undefined,
                abnormalitiesFound: data.abnormalitiesFound,
                abnormalities: data.abnormalities ?? undefined,
                biopsiesTaken: data.biopsiesTaken,
                biopsySites: data.biopsySites ?? undefined,
                balfPerformed: data.balfPerformed,
                balSites: data.balSites ?? undefined,
                balResults: data.balResults ?? undefined,
                brushingsTaken: data.brushingsTaken,
                complications: data.complications ?? undefined,
                postOpInstructions: data.postOpInstructions ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: bronchoscopyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        procedureDate?: string;
        indication?: string;
        anesthesia?: string | null;
        vocalCords?: string | null;
        trachea?: string | null;
        carina?: string | null;
        rightMainBronchus?: string | null;
        leftMainBronchus?: string | null;
        lobarBranches?: string | null;
        segmentalBranches?: string | null;
        abnormalitiesFound?: boolean;
        abnormalities?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        balfPerformed?: boolean;
        balSites?: string | null;
        balResults?: string | null;
        brushingsTaken?: boolean;
        complications?: string | null;
        postOpInstructions?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PulmonologyBronchoscopyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            indication: data.indication,
            anesthesia: data.anesthesia ?? undefined,
            vocalCords: data.vocalCords ?? undefined,
            trachea: data.trachea ?? undefined,
            carina: data.carina ?? undefined,
            rightMainBronchus: data.rightMainBronchus ?? undefined,
            leftMainBronchus: data.leftMainBronchus ?? undefined,
            lobarBranches: data.lobarBranches ?? undefined,
            segmentalBranches: data.segmentalBranches ?? undefined,
            abnormalitiesFound: data.abnormalitiesFound,
            abnormalities: data.abnormalities ?? undefined,
            biopsiesTaken: data.biopsiesTaken,
            biopsySites: data.biopsySites ?? undefined,
            balfPerformed: data.balfPerformed,
            balSites: data.balSites ?? undefined,
            balResults: data.balResults ?? undefined,
            brushingsTaken: data.brushingsTaken,
            complications: data.complications ?? undefined,
            postOpInstructions: data.postOpInstructions ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.procedureDate) {
            updateData.procedureDate = new Date(data.procedureDate);
        }

        return prisma.pulmonologyBronchoscopy.update({
            where: { id },
            data: updateData,
            include: bronchoscopyInclude,
        });
    }

    async delete(id: string) {
        return prisma.pulmonologyBronchoscopy.delete({
            where: { id },
        });
    }
}

export const pulmonologyBronchoscopyService = new PulmonologyBronchoscopyService();
