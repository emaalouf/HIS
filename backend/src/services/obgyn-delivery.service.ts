import { DeliveryMode, Prisma } from '@prisma/client';
import prisma from '../config/database';

const obgynDeliveryInclude = {
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

export class ObgynDeliveryService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        deliveryMode?: DeliveryMode;
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
            deliveryMode,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'deliveryDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ObgynDeliveryWhereInput = {};

        if (deliveryMode) where.deliveryMode = deliveryMode;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.deliveryDate = {};
            if (startDate) where.deliveryDate.gte = new Date(startDate);
            if (endDate) where.deliveryDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { inductionMethod: { contains: search } },
                { anesthesia: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [deliveries, total] = await Promise.all([
            prisma.obgynDelivery.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: obgynDeliveryInclude,
            }),
            prisma.obgynDelivery.count({ where }),
        ]);

        return { deliveries, total };
    }

    async findById(id: string) {
        return prisma.obgynDelivery.findUnique({
            where: { id },
            include: obgynDeliveryInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        deliveryDate: string;
        admissionTime?: string | null;
        deliveryTime?: string | null;
        deliveryMode?: DeliveryMode;
        gestationalAgeWeeks?: number | null;
        laborOnset?: string | null;
        membranesRuptured?: boolean | null;
        fluidColor?: string | null;
        inductionPerformed?: boolean | null;
        inductionMethod?: string | null;
        augmentation?: string | null;
        anesthesia?: string | null;
        secondStageDuration?: number | null;
        episiotomy?: boolean | null;
        laceration?: string | null;
        estimatedBloodLoss?: number | null;
        placentaDelivery?: string | null;
        placentaComplete?: boolean | null;
        babyWeightGrams?: number | null;
        babyLengthCm?: number | null;
        babyHeadCircumferenceCm?: number | null;
        babyGender?: string | null;
        babyApgar1?: number | null;
        babyApgar5?: number | null;
        babyApgar10?: number | null;
        resuscitationNeeded?: boolean | null;
        resuscitationDetails?: string | null;
        nicuAdmission?: boolean | null;
        nicuReason?: string | null;
        maternalComplications?: string | null;
        postpartumHb?: number | null;
        rhogamGiven?: boolean | null;
        dischargeDate?: string | null;
        breastfeedingEstablished?: boolean | null;
        contraceptionCounseling?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.obgynDelivery.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                deliveryDate: new Date(data.deliveryDate),
                admissionTime: data.admissionTime ? new Date(data.admissionTime) : undefined,
                deliveryTime: data.deliveryTime ? new Date(data.deliveryTime) : undefined,
                deliveryMode: data.deliveryMode,
                gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
                laborOnset: data.laborOnset ?? undefined,
                membranesRuptured: data.membranesRuptured ?? undefined,
                fluidColor: data.fluidColor ?? undefined,
                inductionPerformed: data.inductionPerformed ?? undefined,
                inductionMethod: data.inductionMethod ?? undefined,
                augmentation: data.augmentation ?? undefined,
                anesthesia: data.anesthesia ?? undefined,
                secondStageDuration: data.secondStageDuration ?? undefined,
                episiotomy: data.episiotomy ?? undefined,
                laceration: data.laceration ?? undefined,
                estimatedBloodLoss: data.estimatedBloodLoss ?? undefined,
                placentaDelivery: data.placentaDelivery ?? undefined,
                placentaComplete: data.placentaComplete ?? undefined,
                babyWeightGrams: data.babyWeightGrams ?? undefined,
                babyLengthCm: data.babyLengthCm ?? undefined,
                babyHeadCircumferenceCm: data.babyHeadCircumferenceCm ?? undefined,
                babyGender: data.babyGender ?? undefined,
                babyApgar1: data.babyApgar1 ?? undefined,
                babyApgar5: data.babyApgar5 ?? undefined,
                babyApgar10: data.babyApgar10 ?? undefined,
                resuscitationNeeded: data.resuscitationNeeded ?? undefined,
                resuscitationDetails: data.resuscitationDetails ?? undefined,
                nicuAdmission: data.nicuAdmission ?? undefined,
                nicuReason: data.nicuReason ?? undefined,
                maternalComplications: data.maternalComplications ?? undefined,
                postpartumHb: data.postpartumHb ?? undefined,
                rhogamGiven: data.rhogamGiven ?? undefined,
                dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
                breastfeedingEstablished: data.breastfeedingEstablished ?? undefined,
                contraceptionCounseling: data.contraceptionCounseling ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: obgynDeliveryInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        deliveryDate?: string;
        admissionTime?: string | null;
        deliveryTime?: string | null;
        deliveryMode?: DeliveryMode;
        gestationalAgeWeeks?: number | null;
        laborOnset?: string | null;
        membranesRuptured?: boolean | null;
        fluidColor?: string | null;
        inductionPerformed?: boolean | null;
        inductionMethod?: string | null;
        augmentation?: string | null;
        anesthesia?: string | null;
        secondStageDuration?: number | null;
        episiotomy?: boolean | null;
        laceration?: string | null;
        estimatedBloodLoss?: number | null;
        placentaDelivery?: string | null;
        placentaComplete?: boolean | null;
        babyWeightGrams?: number | null;
        babyLengthCm?: number | null;
        babyHeadCircumferenceCm?: number | null;
        babyGender?: string | null;
        babyApgar1?: number | null;
        babyApgar5?: number | null;
        babyApgar10?: number | null;
        resuscitationNeeded?: boolean | null;
        resuscitationDetails?: string | null;
        nicuAdmission?: boolean | null;
        nicuReason?: string | null;
        maternalComplications?: string | null;
        postpartumHb?: number | null;
        rhogamGiven?: boolean | null;
        dischargeDate?: string | null;
        breastfeedingEstablished?: boolean | null;
        contraceptionCounseling?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.ObgynDeliveryUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            deliveryMode: data.deliveryMode,
            gestationalAgeWeeks: data.gestationalAgeWeeks ?? undefined,
            laborOnset: data.laborOnset ?? undefined,
            membranesRuptured: data.membranesRuptured ?? undefined,
            fluidColor: data.fluidColor ?? undefined,
            inductionPerformed: data.inductionPerformed ?? undefined,
            inductionMethod: data.inductionMethod ?? undefined,
            augmentation: data.augmentation ?? undefined,
            anesthesia: data.anesthesia ?? undefined,
            secondStageDuration: data.secondStageDuration ?? undefined,
            episiotomy: data.episiotomy ?? undefined,
            laceration: data.laceration ?? undefined,
            estimatedBloodLoss: data.estimatedBloodLoss ?? undefined,
            placentaDelivery: data.placentaDelivery ?? undefined,
            placentaComplete: data.placentaComplete ?? undefined,
            babyWeightGrams: data.babyWeightGrams ?? undefined,
            babyLengthCm: data.babyLengthCm ?? undefined,
            babyHeadCircumferenceCm: data.babyHeadCircumferenceCm ?? undefined,
            babyGender: data.babyGender ?? undefined,
            babyApgar1: data.babyApgar1 ?? undefined,
            babyApgar5: data.babyApgar5 ?? undefined,
            babyApgar10: data.babyApgar10 ?? undefined,
            resuscitationNeeded: data.resuscitationNeeded ?? undefined,
            resuscitationDetails: data.resuscitationDetails ?? undefined,
            nicuAdmission: data.nicuAdmission ?? undefined,
            nicuReason: data.nicuReason ?? undefined,
            maternalComplications: data.maternalComplications ?? undefined,
            postpartumHb: data.postpartumHb ?? undefined,
            rhogamGiven: data.rhogamGiven ?? undefined,
            breastfeedingEstablished: data.breastfeedingEstablished ?? undefined,
            contraceptionCounseling: data.contraceptionCounseling ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.deliveryDate) {
            updateData.deliveryDate = new Date(data.deliveryDate);
        }
        if (data.admissionTime !== undefined) {
            updateData.admissionTime = data.admissionTime ? new Date(data.admissionTime) : null;
        }
        if (data.deliveryTime !== undefined) {
            updateData.deliveryTime = data.deliveryTime ? new Date(data.deliveryTime) : null;
        }
        if (data.dischargeDate !== undefined) {
            updateData.dischargeDate = data.dischargeDate ? new Date(data.dischargeDate) : null;
        }

        return prisma.obgynDelivery.update({
            where: { id },
            data: updateData,
            include: obgynDeliveryInclude,
        });
    }

    async delete(id: string) {
        return prisma.obgynDelivery.delete({
            where: { id },
        });
    }
}

export const obgynDeliveryService = new ObgynDeliveryService();
