import { ClaimStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';

const claimInclude = {
    invoice: {
        select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
        },
    },
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
};

export class ClaimService {
    async list(options: {
        page: number;
        limit: number;
        status?: ClaimStatus;
        patientId?: string;
        invoiceId?: string;
        payerName?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            status,
            patientId,
            invoiceId,
            payerName,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.ClaimWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (invoiceId) where.invoiceId = invoiceId;
        if (payerName) {
            where.payerName = { contains: payerName, mode: 'insensitive' };
        }

        const [claims, total] = await Promise.all([
            prisma.claim.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: claimInclude,
            }),
            prisma.claim.count({ where }),
        ]);

        return { claims, total };
    }

    async findById(id: string) {
        return prisma.claim.findUnique({
            where: { id },
            include: claimInclude,
        });
    }

    async create(data: {
        invoiceId: string;
        patientId: string;
        payerName: string;
        status?: ClaimStatus;
        submittedAt?: string | null;
        resolvedAt?: string | null;
        notes?: string | null;
    }) {
        return prisma.claim.create({
            data: {
                invoiceId: data.invoiceId,
                patientId: data.patientId,
                payerName: data.payerName,
                status: data.status,
                submittedAt: data.submittedAt ? new Date(data.submittedAt) : undefined,
                resolvedAt: data.resolvedAt ? new Date(data.resolvedAt) : undefined,
                notes: data.notes ?? undefined,
            },
            include: claimInclude,
        });
    }

    async update(id: string, data: {
        invoiceId?: string;
        patientId?: string;
        payerName?: string;
        status?: ClaimStatus;
        submittedAt?: string | null;
        resolvedAt?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.ClaimUpdateInput = {
            invoiceId: data.invoiceId,
            patientId: data.patientId,
            payerName: data.payerName,
            status: data.status,
            notes: data.notes ?? undefined,
        };

        if (data.submittedAt) {
            updateData.submittedAt = new Date(data.submittedAt);
        }

        if (data.resolvedAt) {
            updateData.resolvedAt = new Date(data.resolvedAt);
        }

        return prisma.claim.update({
            where: { id },
            data: updateData,
            include: claimInclude,
        });
    }

    async delete(id: string) {
        return prisma.claim.delete({
            where: { id },
        });
    }
}

export const claimService = new ClaimService();
