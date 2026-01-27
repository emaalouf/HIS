import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const gastroEndoscopyInclude = {
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

export class GastroEndoscopyService {
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

        const where: Prisma.GastroEndoscopyWhereInput = {};

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
            prisma.gastroEndoscopy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: gastroEndoscopyInclude,
            }),
            prisma.gastroEndoscopy.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.gastroEndoscopy.findUnique({
            where: { id },
            include: gastroEndoscopyInclude,
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
        esophagus?: string | null;
        gastroesophagealJunction?: string | null;
        stomach?: string | null;
        pylorus?: string | null;
        duodenum?: string | null;
        mucosalAppearance?: string | null;
        lesionsFound?: boolean;
        lesionsDescription?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        hemostasisPerformed?: boolean;
        hemostasisMethod?: string | null;
        polypectomy?: boolean;
        polypsRemoved?: number;
        polypSizeMm?: number | null;
        complications?: string | null;
        recommendations?: string | null;
        followUpInterval?: string | null;
        prepQuality?: string | null;
        notes?: string | null;
    }) {
        return prisma.gastroEndoscopy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                procedureDate: new Date(data.procedureDate),
                indication: data.indication,
                status: data.status as any,
                sedationType: data.sedationType ?? undefined,
                scopeInsertion: data.scopeInsertion ?? undefined,
                esophagus: data.esophagus ?? undefined,
                gastroesophagealJunction: data.gastroesophagealJunction ?? undefined,
                stomach: data.stomach ?? undefined,
                pylorus: data.pylorus ?? undefined,
                duodenum: data.duodenum ?? undefined,
                mucosalAppearance: data.mucosalAppearance ?? undefined,
                lesionsFound: data.lesionsFound,
                lesionsDescription: data.lesionsDescription ?? undefined,
                biopsiesTaken: data.biopsiesTaken,
                biopsySites: data.biopsySites ?? undefined,
                hemostasisPerformed: data.hemostasisPerformed,
                hemostasisMethod: data.hemostasisMethod ?? undefined,
                polypectomy: data.polypectomy,
                polypsRemoved: data.polypsRemoved,
                polypSizeMm: data.polypSizeMm ?? undefined,
                complications: data.complications ?? undefined,
                recommendations: data.recommendations ?? undefined,
                followUpInterval: data.followUpInterval ?? undefined,
                prepQuality: data.prepQuality as any,
                notes: data.notes ?? undefined,
            },
            include: gastroEndoscopyInclude,
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
        esophagus?: string | null;
        gastroesophagealJunction?: string | null;
        stomach?: string | null;
        pylorus?: string | null;
        duodenum?: string | null;
        mucosalAppearance?: string | null;
        lesionsFound?: boolean;
        lesionsDescription?: string | null;
        biopsiesTaken?: number;
        biopsySites?: string | null;
        hemostasisPerformed?: boolean;
        hemostasisMethod?: string | null;
        polypectomy?: boolean;
        polypsRemoved?: number;
        polypSizeMm?: number | null;
        complications?: string | null;
        recommendations?: string | null;
        followUpInterval?: string | null;
        prepQuality?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.GastroEndoscopyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            indication: data.indication,
            status: data.status as any,
            sedationType: data.sedationType ?? undefined,
            scopeInsertion: data.scopeInsertion ?? undefined,
            esophagus: data.esophagus ?? undefined,
            gastroesophagealJunction: data.gastroesophagealJunction ?? undefined,
            stomach: data.stomach ?? undefined,
            pylorus: data.pylorus ?? undefined,
            duodenum: data.duodenum ?? undefined,
            mucosalAppearance: data.mucosalAppearance ?? undefined,
            lesionsFound: data.lesionsFound,
            lesionsDescription: data.lesionsDescription ?? undefined,
            biopsiesTaken: data.biopsiesTaken,
            biopsySites: data.biopsySites ?? undefined,
            hemostasisPerformed: data.hemostasisPerformed,
            hemostasisMethod: data.hemostasisMethod ?? undefined,
            polypectomy: data.polypectomy,
            polypsRemoved: data.polypsRemoved,
            polypSizeMm: data.polypSizeMm ?? undefined,
            complications: data.complications ?? undefined,
            recommendations: data.recommendations ?? undefined,
            followUpInterval: data.followUpInterval ?? undefined,
            prepQuality: data.prepQuality as any,
            notes: data.notes ?? undefined,
        };

        if (data.procedureDate) {
            updateData.procedureDate = new Date(data.procedureDate);
        }

        return prisma.gastroEndoscopy.update({
            where: { id },
            data: updateData,
            include: gastroEndoscopyInclude,
        });
    }

    async delete(id: string) {
        return prisma.gastroEndoscopy.delete({
            where: { id },
        });
    }
}

export const gastroEndoscopyService = new GastroEndoscopyService();
