import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const gastroColonoscopyInclude = {
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
        },
    },
};

export class GastroColonoscopyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
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
            startDate,
            endDate,
            sortBy = 'procedureDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.GastroColonoscopyWhereInput = {};

        if (patientId) where.patientId = patientId;

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
                { indication: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.gastroColonoscopy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: gastroColonoscopyInclude,
            }),
            prisma.gastroColonoscopy.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.gastroColonoscopy.findUnique({
            where: { id },
            include: gastroColonoscopyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        procedureDate: string;
        indication: string;
        status?: string;
        sedationType?: string | null;
        scopeInsertion?: string | null;
        cecalIntubation?: boolean;
        cecalIntubationTime?: number | null;
        withdrawalTime?: number | null;
        prepQuality?: string | null;
        ileumExamined?: boolean;
        mucosalAppearance?: string | null;
        lesionsFound?: boolean;
        lesionsDescription?: string | null;
        polypsFound?: boolean;
        polypsRemoved?: number;
        polypSizeMaxMm?: number | null;
        polypHistology?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        hemostasisPerformed?: boolean;
        complications?: string | null;
        recommendations?: string | null;
        followUpInterval?: string | null;
        notes?: string | null;
    }) {
        return prisma.gastroColonoscopy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                procedureDate: new Date(data.procedureDate),
                indication: data.indication,
                status: data.status as any,
                sedationType: data.sedationType ?? undefined,
                scopeInsertion: data.scopeInsertion ?? undefined,
                cecalIntubation: data.cecalIntubation,
                cecalIntubationTime: data.cecalIntubationTime ?? undefined,
                withdrawalTime: data.withdrawalTime ?? undefined,
                prepQuality: data.prepQuality as any,
                ileumExamined: data.ileumExamined,
                mucosalAppearance: data.mucosalAppearance ?? undefined,
                lesionsFound: data.lesionsFound,
                lesionsDescription: data.lesionsDescription ?? undefined,
                polypsFound: data.polypsFound,
                polypsRemoved: data.polypsRemoved,
                polypSizeMaxMm: data.polypSizeMaxMm ?? undefined,
                polypHistology: data.polypHistology ?? undefined,
                biopsiesTaken: data.biopsiesTaken,
                biopsySites: data.biopsySites ?? undefined,
                hemostasisPerformed: data.hemostasisPerformed,
                complications: data.complications ?? undefined,
                recommendations: data.recommendations ?? undefined,
                followUpInterval: data.followUpInterval ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: gastroColonoscopyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        procedureDate?: string;
        indication?: string;
        status?: string;
        sedationType?: string | null;
        scopeInsertion?: string | null;
        cecalIntubation?: boolean;
        cecalIntubationTime?: number | null;
        withdrawalTime?: number | null;
        prepQuality?: string | null;
        ileumExamined?: boolean;
        mucosalAppearance?: string | null;
        lesionsFound?: boolean;
        lesionsDescription?: string | null;
        polypsFound?: boolean;
        polypsRemoved?: number;
        polypSizeMaxMm?: number | null;
        polypHistology?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        hemostasisPerformed?: boolean;
        complications?: string | null;
        recommendations?: string | null;
        followUpInterval?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.GastroColonoscopyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            indication: data.indication,
            status: data.status as any,
            sedationType: data.sedationType ?? undefined,
            scopeInsertion: data.scopeInsertion ?? undefined,
            cecalIntubation: data.cecalIntubation,
            cecalIntubationTime: data.cecalIntubationTime ?? undefined,
            withdrawalTime: data.withdrawalTime ?? undefined,
            prepQuality: data.prepQuality as any,
            ileumExamined: data.ileumExamined,
            mucosalAppearance: data.mucosalAppearance ?? undefined,
            lesionsFound: data.lesionsFound,
            lesionsDescription: data.lesionsDescription ?? undefined,
            polypsFound: data.polypsFound,
            polypsRemoved: data.polypsRemoved,
            polypSizeMaxMm: data.polypSizeMaxMm ?? undefined,
            polypHistology: data.polypHistology ?? undefined,
            biopsiesTaken: data.biopsiesTaken,
            biopsySites: data.biopsySites ?? undefined,
            hemostasisPerformed: data.hemostasisPerformed,
            complications: data.complications ?? undefined,
            recommendations: data.recommendations ?? undefined,
            followUpInterval: data.followUpInterval ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.procedureDate) {
            updateData.procedureDate = new Date(data.procedureDate);
        }

        return prisma.gastroColonoscopy.update({
            where: { id },
            data: updateData,
            include: gastroColonoscopyInclude,
        });
    }

    async delete(id: string) {
        return prisma.gastroColonoscopy.delete({
            where: { id },
        });
    }
}

export const gastroColonoscopyService = new GastroColonoscopyService();
