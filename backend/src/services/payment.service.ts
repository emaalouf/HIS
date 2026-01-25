import { InvoiceStatus, PaymentMethod, Prisma } from '@prisma/client';
import prisma from '../config/database';

const paymentInclude = {
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
    receivedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    },
};

export class PaymentService {
    async list(options: {
        page: number;
        limit: number;
        method?: PaymentMethod;
        patientId?: string;
        invoiceId?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            method,
            patientId,
            invoiceId,
            startDate,
            endDate,
            sortBy = 'paidAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.PaymentWhereInput = {};

        if (method) where.method = method;
        if (patientId) where.patientId = patientId;
        if (invoiceId) where.invoiceId = invoiceId;

        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate) where.paidAt.gte = new Date(startDate);
            if (endDate) where.paidAt.lte = new Date(endDate);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: paymentInclude,
            }),
            prisma.payment.count({ where }),
        ]);

        return { payments, total };
    }

    async findById(id: string) {
        return prisma.payment.findUnique({
            where: { id },
            include: paymentInclude,
        });
    }

    async create(data: {
        invoiceId: string;
        patientId: string;
        amount: number;
        method: PaymentMethod;
        paidAt?: string | null;
        reference?: string | null;
        receivedById?: string | null;
        notes?: string | null;
    }) {
        return prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    invoiceId: data.invoiceId,
                    patientId: data.patientId,
                    amount: data.amount,
                    method: data.method,
                    paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
                    reference: data.reference ?? undefined,
                    receivedById: data.receivedById || undefined,
                    notes: data.notes ?? undefined,
                },
                include: paymentInclude,
            });

            const totals = await tx.payment.aggregate({
                where: { invoiceId: data.invoiceId },
                _sum: { amount: true },
            });

            const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
            if (invoice) {
                const paidTotal = totals._sum.amount ?? 0;
                const newStatus = paidTotal >= invoice.totalAmount
                    ? InvoiceStatus.PAID
                    : InvoiceStatus.PARTIAL;
                await tx.invoice.update({
                    where: { id: data.invoiceId },
                    data: { status: newStatus },
                });
            }

            return payment;
        });
    }

    async update(id: string, data: {
        invoiceId?: string;
        patientId?: string;
        amount?: number;
        method?: PaymentMethod;
        paidAt?: string | null;
        reference?: string | null;
        receivedById?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.PaymentUncheckedUpdateInput = {
            invoiceId: data.invoiceId,
            patientId: data.patientId,
            amount: data.amount,
            method: data.method,
            reference: data.reference ?? undefined,
            receivedById: data.receivedById ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.paidAt) {
            updateData.paidAt = new Date(data.paidAt);
        }

        return prisma.payment.update({
            where: { id },
            data: updateData,
            include: paymentInclude,
        });
    }

    async delete(id: string) {
        return prisma.payment.delete({
            where: { id },
        });
    }
}

export const paymentService = new PaymentService();
