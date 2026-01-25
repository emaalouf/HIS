import { Prisma, Role } from '@prisma/client';
import prisma from '../config/database';

const providerSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    phone: true,
    specialty: true,
    licenseNumber: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    departmentId: true,
    department: {
        select: {
            id: true,
            name: true,
        },
    },
};

export class ProviderService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        role?: Role;
        specialty?: string;
        isActive?: boolean;
        departmentId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            role,
            specialty,
            isActive,
            departmentId,
            sortBy = 'lastName',
            sortOrder = 'asc',
        } = options;
        const skip = (page - 1) * limit;
        const allowedSortFields = new Set([
            'firstName',
            'lastName',
            'email',
            'role',
            'specialty',
            'createdAt',
            'updatedAt',
        ]);
        const resolvedSortBy = allowedSortFields.has(sortBy) ? sortBy : 'lastName';

        const where: Prisma.UserWhereInput = {
            role: role ? role : { in: [Role.DOCTOR, Role.NURSE] },
        };

        if (isActive !== undefined) where.isActive = isActive;
        if (departmentId) where.departmentId = departmentId;

        if (specialty) {
            where.specialty = { contains: specialty, mode: 'insensitive' };
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { licenseNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [providers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [resolvedSortBy]: sortOrder },
                select: providerSelect,
            }),
            prisma.user.count({ where }),
        ]);

        return { providers, total };
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: providerSelect,
        });
    }

    async create(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: Role;
        phone?: string | null;
        specialty?: string | null;
        licenseNumber?: string | null;
        departmentId?: string | null;
        isActive?: boolean;
    }) {
        return prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone === null ? null : data.phone,
                specialty: data.specialty === null ? null : data.specialty,
                licenseNumber: data.licenseNumber === null ? null : data.licenseNumber,
                departmentId: data.departmentId === null ? null : data.departmentId,
                isActive: data.isActive ?? true,
            },
            select: providerSelect,
        });
    }

    async update(id: string, data: {
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: Role;
        phone?: string | null;
        specialty?: string | null;
        licenseNumber?: string | null;
        departmentId?: string | null;
        isActive?: boolean;
    }) {
        return prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone === null ? null : data.phone,
                specialty: data.specialty === null ? null : data.specialty,
                licenseNumber: data.licenseNumber === null ? null : data.licenseNumber,
                departmentId: data.departmentId === null ? null : data.departmentId,
                isActive: data.isActive,
            },
            select: providerSelect,
        });
    }

    async delete(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    }
}

export const providerService = new ProviderService();
