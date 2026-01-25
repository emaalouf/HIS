import prisma from '../config/database';
import { generateMRN } from '../utils/helpers';
import { CreatePatientInput, UpdatePatientInput, CreateMedicalHistoryInput } from '../utils/validators';
import { Prisma } from '@prisma/client';

export class PatientService {
    async create(data: CreatePatientInput) {
        const mrn = generateMRN();

        return prisma.patient.create({
            data: {
                mrn,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: new Date(data.dateOfBirth),
                gender: data.gender,
                bloodType: data.bloodType || 'UNKNOWN',
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                country: data.country,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                emergencyContactRelation: data.emergencyContactRelation,
                allergies: data.allergies || [],
                chronicConditions: data.chronicConditions || [],
            },
        });
    }

    async findAll(options: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        isActive?: boolean;
    }) {
        const { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc', isActive } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PatientWhereInput = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { mrn: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    mrn: true,
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    gender: true,
                    phone: true,
                    email: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            prisma.patient.count({ where }),
        ]);

        return { patients, total };
    }

    async findById(id: string) {
        return prisma.patient.findUnique({
            where: { id },
            include: {
                medicalHistories: {
                    orderBy: { visitDate: 'desc' },
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                documents: {
                    orderBy: { uploadedAt: 'desc' },
                    include: {
                        uploadedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(id: string, data: UpdatePatientInput) {
        const updateData: Prisma.PatientUncheckedUpdateInput = { ...data };

        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth);
        }

        return prisma.patient.update({
            where: { id },
            data: updateData,
        });
    }

    async softDelete(id: string) {
        return prisma.patient.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async addMedicalHistory(patientId: string, doctorId: string, data: CreateMedicalHistoryInput) {
        return prisma.medicalHistory.create({
            data: {
                patientId,
                doctorId,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                notes: data.notes,
                visitDate: new Date(data.visitDate),
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async getMedicalHistory(patientId: string) {
        return prisma.medicalHistory.findMany({
            where: { patientId },
            orderBy: { visitDate: 'desc' },
            include: {
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, active, todayRegistrations] = await Promise.all([
            prisma.patient.count(),
            prisma.patient.count({ where: { isActive: true } }),
            prisma.patient.count({
                where: {
                    createdAt: { gte: today },
                },
            }),
        ]);

        return { total, active, todayRegistrations };
    }
}

export const patientService = new PatientService();
