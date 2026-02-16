import { PregnancyStatus, DeliveryMode, Prisma } from '@prisma/client';
import prisma from '../config/database';

const obgynPregnancyInclude = {
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

export class ObgynPregnancyService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: PregnancyStatus;
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
            status,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ObgynPregnancyWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.lmpDate = {};
            if (startDate) where.lmpDate.gte = new Date(startDate);
            if (endDate) where.lmpDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { riskFactors: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [pregnancies, total] = await Promise.all([
            prisma.obgynPregnancy.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: obgynPregnancyInclude,
            }),
            prisma.obgynPregnancy.count({ where }),
        ]);

        return { pregnancies, total };
    }

    async findById(id: string) {
        return prisma.obgynPregnancy.findUnique({
            where: { id },
            include: obgynPregnancyInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        lmpDate: string;
        eddDate: string;
        gestationalAgeWeeks?: number | null;
        gravida?: number | null;
        para?: number | null;
        abortions?: number | null;
        livingChildren?: number | null;
        status?: PregnancyStatus;
        conceptionMethod?: string | null;
        ivfCycleNumber?: number | null;
        multipleGestation?: boolean | null;
        numberOfFetuses?: number | null;
        riskFactors?: string | null;
        previousCesarean?: number | null;
        rhStatus?: string | null;
        rubellaStatus?: string | null;
        hepatitisBStatus?: string | null;
        hivStatus?: string | null;
        syphilisStatus?: string | null;
        gbsStatus?: string | null;
        initialWeight?: number | null;
        initialBmi?: number | null;
        preExistingConditions?: string | null;
        currentMedications?: string | null;
        allergies?: string | null;
        deliveryDate?: string | null;
        deliveryMode?: DeliveryMode | null;
        deliveryOutcome?: string | null;
        babyWeightGrams?: number | null;
        babyApgar1?: number | null;
        babyApgar5?: number | null;
        babyApgar10?: number | null;
        complications?: string | null;
        notes?: string | null;
    }) {
        return prisma.obgynPregnancy.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                lmpDate: new Date(data.lmpDate),
                eddDate: new Date(data.eddDate),
                gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
                gravida: data.gravida ?? undefined,
                para: data.para ?? undefined,
                abortions: data.abortions ?? undefined,
                livingChildren: data.livingChildren ?? undefined,
                status: data.status,
                conceptionMethod: data.conceptionMethod ?? undefined,
                ivfCycleNumber: data.ivfCycleNumber ?? undefined,
                multipleGestation: data.multipleGestation ?? undefined,
                numberOfFetuses: data.numberOfFetuses ?? undefined,
                riskFactors: data.riskFactors ?? undefined,
                previousCesarean: data.previousCesarean ?? undefined,
                rhStatus: data.rhStatus ?? undefined,
                rubellaStatus: data.rubellaStatus ?? undefined,
                hepatitisBStatus: data.hepatitisBStatus ?? undefined,
                hivStatus: data.hivStatus ?? undefined,
                syphilisStatus: data.syphilisStatus ?? undefined,
                gbsStatus: data.gbsStatus ?? undefined,
                initialWeight: data.initialWeight ?? undefined,
                initialBmi: data.initialBmi ?? undefined,
                preExistingConditions: data.preExistingConditions ?? undefined,
                currentMedications: data.currentMedications ?? undefined,
                allergies: data.allergies ?? undefined,
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
                deliveryMode: data.deliveryMode ?? undefined,
                deliveryOutcome: data.deliveryOutcome ?? undefined,
                babyWeightGrams: data.babyWeightGrams ?? undefined,
                babyApgar1: data.babyApgar1 ?? undefined,
                babyApgar5: data.babyApgar5 ?? undefined,
                babyApgar10: data.babyApgar10 ?? undefined,
                complications: data.complications ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: obgynPregnancyInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        lmpDate?: string;
        eddDate?: string;
        gestationalAgeWeeks?: number | null;
        gravida?: number | null;
        para?: number | null;
        abortions?: number | null;
        livingChildren?: number | null;
        status?: PregnancyStatus;
        conceptionMethod?: string | null;
        ivfCycleNumber?: number | null;
        multipleGestation?: boolean | null;
        numberOfFetuses?: number | null;
        riskFactors?: string | null;
        previousCesarean?: number | null;
        rhStatus?: string | null;
        rubellaStatus?: string | null;
        hepatitisBStatus?: string | null;
        hivStatus?: string | null;
        syphilisStatus?: string | null;
        gbsStatus?: string | null;
        initialWeight?: number | null;
        initialBmi?: number | null;
        preExistingConditions?: string | null;
        currentMedications?: string | null;
        allergies?: string | null;
        deliveryDate?: string | null;
        deliveryMode?: DeliveryMode | null;
        deliveryOutcome?: string | null;
        babyWeightGrams?: number | null;
        babyApgar1?: number | null;
        babyApgar5?: number | null;
        babyApgar10?: number | null;
        complications?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.ObgynPregnancyUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
            gravida: data.gravida ?? undefined,
            para: data.para ?? undefined,
            abortions: data.abortions ?? undefined,
            livingChildren: data.livingChildren ?? undefined,
            status: data.status,
            conceptionMethod: data.conceptionMethod ?? undefined,
            ivfCycleNumber: data.ivfCycleNumber ?? undefined,
            multipleGestation: data.multipleGestation ?? undefined,
            numberOfFetuses: data.numberOfFetuses ?? undefined,
            riskFactors: data.riskFactors ?? undefined,
            previousCesarean: data.previousCesarean ?? undefined,
            rhStatus: data.rhStatus ?? undefined,
            rubellaStatus: data.rubellaStatus ?? undefined,
            hepatitisBStatus: data.hepatitisBStatus ?? undefined,
            hivStatus: data.hivStatus ?? undefined,
            syphilisStatus: data.syphilisStatus ?? undefined,
            gbsStatus: data.gbsStatus ?? undefined,
            initialWeight: data.initialWeight ?? undefined,
            initialBmi: data.initialBmi ?? undefined,
            preExistingConditions: data.preExistingConditions ?? undefined,
            currentMedications: data.currentMedications ?? undefined,
            allergies: data.allergies ?? undefined,
            deliveryMode: data.deliveryMode ?? undefined,
            deliveryOutcome: data.deliveryOutcome ?? undefined,
            babyWeightGrams: data.babyWeightGrams ?? undefined,
            babyApgar1: data.babyApgar1 ?? undefined,
            babyApgar5: data.babyApgar5 ?? undefined,
            babyApgar10: data.babyApgar10 ?? undefined,
            complications: data.complications ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.lmpDate) {
            updateData.lmpDate = new Date(data.lmpDate);
        }
        if (data.eddDate) {
            updateData.eddDate = new Date(data.eddDate);
        }
        if (data.deliveryDate !== undefined) {
            updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
        }

        return prisma.obgynPregnancy.update({
            where: { id },
            data: updateData,
            include: obgynPregnancyInclude,
        });
    }

    async delete(id: string) {
        return prisma.obgynPregnancy.delete({
            where: { id },
        });
    }
}

export const obgynPregnancyService = new ObgynPregnancyService();
