import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const pedsVaccinationInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
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

export class PedsVaccinationService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        providerId?: string;
        vaccineName?: string;
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
            vaccineName,
            startDate,
            endDate,
            sortBy = 'dateGiven',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PedsVaccinationWhereInput = {};

        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;
        if (vaccineName) where.vaccineName = { contains: vaccineName };

        if (startDate || endDate) {
            where.dateGiven = {};
            if (startDate) where.dateGiven.gte = new Date(startDate);
            if (endDate) where.dateGiven.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { vaccineName: { contains: search } },
                { vaccineCode: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [vaccinations, total] = await Promise.all([
            prisma.pedsVaccination.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: pedsVaccinationInclude,
            }),
            prisma.pedsVaccination.count({ where }),
        ]);

        return { vaccinations, total };
    }

    async findById(id: string) {
        return prisma.pedsVaccination.findUnique({
            where: { id },
            include: pedsVaccinationInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        vaccineName: string;
        vaccineCode?: string | null;
        doseNumber?: number | null;
        totalDoses?: number | null;
        dateGiven: string;
        ageAtVaccination?: string | null;
        site?: string | null;
        route?: string | null;
        lotNumber?: string | null;
        manufacturer?: string | null;
        expirationDate?: string | null;
        sideEffects?: string | null;
        contraindications?: string | null;
        catchUpSchedule?: boolean | null;
        dueDate?: string | null;
        nextDoseDue?: string | null;
        administeredBy?: string | null;
        consentSigned?: boolean | null;
        notes?: string | null;
    }) {
        return prisma.pedsVaccination.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                vaccineName: data.vaccineName,
                vaccineCode: data.vaccineCode ?? undefined,
                doseNumber: data.doseNumber ?? undefined,
                totalDoses: data.totalDoses ?? undefined,
                dateGiven: new Date(data.dateGiven),
                ageAtVaccination: data.ageAtVaccination ?? undefined,
                site: data.site ?? undefined,
                route: data.route ?? undefined,
                lotNumber: data.lotNumber ?? undefined,
                manufacturer: data.manufacturer ?? undefined,
                expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
                sideEffects: data.sideEffects ?? undefined,
                contraindications: data.contraindications ?? undefined,
                catchUpSchedule: data.catchUpSchedule ?? undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                nextDoseDue: data.nextDoseDue ? new Date(data.nextDoseDue) : undefined,
                administeredBy: data.administeredBy ?? undefined,
                consentSigned: data.consentSigned ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: pedsVaccinationInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        vaccineName?: string;
        vaccineCode?: string | null;
        doseNumber?: number | null;
        totalDoses?: number | null;
        dateGiven?: string;
        ageAtVaccination?: string | null;
        site?: string | null;
        route?: string | null;
        lotNumber?: string | null;
        manufacturer?: string | null;
        expirationDate?: string | null;
        sideEffects?: string | null;
        contraindications?: string | null;
        catchUpSchedule?: boolean | null;
        dueDate?: string | null;
        nextDoseDue?: string | null;
        administeredBy?: string | null;
        consentSigned?: boolean | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PedsVaccinationUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            vaccineName: data.vaccineName,
            vaccineCode: data.vaccineCode ?? undefined,
            doseNumber: data.doseNumber ?? undefined,
            totalDoses: data.totalDoses ?? undefined,
            ageAtVaccination: data.ageAtVaccination ?? undefined,
            site: data.site ?? undefined,
            route: data.route ?? undefined,
            lotNumber: data.lotNumber ?? undefined,
            manufacturer: data.manufacturer ?? undefined,
            sideEffects: data.sideEffects ?? undefined,
            contraindications: data.contraindications ?? undefined,
            catchUpSchedule: data.catchUpSchedule ?? undefined,
            administeredBy: data.administeredBy ?? undefined,
            consentSigned: data.consentSigned ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.dateGiven) {
            updateData.dateGiven = new Date(data.dateGiven);
        }
        if (data.expirationDate !== undefined) {
            updateData.expirationDate = data.expirationDate ? new Date(data.expirationDate) : null;
        }
        if (data.dueDate !== undefined) {
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        }
        if (data.nextDoseDue !== undefined) {
            updateData.nextDoseDue = data.nextDoseDue ? new Date(data.nextDoseDue) : null;
        }

        return prisma.pedsVaccination.update({
            where: { id },
            data: updateData,
            include: pedsVaccinationInclude,
        });
    }

    async delete(id: string) {
        return prisma.pedsVaccination.delete({
            where: { id },
        });
    }
}

export const pedsVaccinationService = new PedsVaccinationService();
