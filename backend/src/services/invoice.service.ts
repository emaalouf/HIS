import { InvoiceStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { generateInvoiceNumber } from '../utils/helpers';

const invoiceInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
    encounter: {
        select: {
            id: true,
            startTime: true,
            status: true,
        },
    },
    items: true,
    payments: true,
    claims: true,
};

type InvoiceItemInput = {
    description: string;
    quantity?: number;
    unitPrice: number;
};

const calculateTotal = (items: InvoiceItemInput[]): number => {
    return items.reduce((sum, item) => {
        const quantity = item.quantity ?? 1;
        return sum + quantity * item.unitPrice;
    }, 0);
};

const mapItems = (items: InvoiceItemInput[]) => {
    return items.map((item) => ({
        description: item.description,
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice,
        totalPrice: (item.quantity ?? 1) * item.unitPrice,
    }));
};

export class InvoiceService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        status?: InvoiceStatus;
        patientId?: string;
        encounterId?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            status,
            patientId,
            encounterId,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.InvoiceWhereInput = {};

        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (encounterId) where.encounterId = encounterId;

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { patient: { firstName: { contains: search, mode: 'insensitive' } } },
                { patient: { lastName: { contains: search, mode: 'insensitive' } } },
                { patient: { mrn: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: invoiceInclude,
            }),
            prisma.invoice.count({ where }),
        ]);

        return { invoices, total };
    }

    async findById(id: string) {
        return prisma.invoice.findUnique({
            where: { id },
            include: invoiceInclude,
        });
    }

    async create(data: {
        patientId: string;
        encounterId?: string | null;
        status?: InvoiceStatus;
        totalAmount?: number;
        dueDate?: string | null;
        notes?: string | null;
        items?: InvoiceItemInput[];
        createdById?: string | null;
    }) {
        const items = data.items ?? [];
        const totalFromItems = items.length > 0 ? calculateTotal(items) : undefined;
        const totalAmount = totalFromItems ?? data.totalAmount ?? 0;

        return prisma.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(),
                patientId: data.patientId,
                encounterId: data.encounterId || undefined,
                status: data.status,
                totalAmount,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                notes: data.notes ?? undefined,
                createdById: data.createdById || undefined,
                items: items.length > 0 ? { create: mapItems(items) } : undefined,
            },
            include: invoiceInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        encounterId?: string | null;
        status?: InvoiceStatus;
        totalAmount?: number;
        dueDate?: string | null;
        notes?: string | null;
        items?: InvoiceItemInput[];
    }) {
        return prisma.$transaction(async (tx) => {
            let totalAmount = data.totalAmount;

            if (data.items) {
                totalAmount = data.items.length > 0 ? calculateTotal(data.items) : 0;
                await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
                if (data.items.length > 0) {
                    await tx.invoiceItem.createMany({
                        data: mapItems(data.items).map((item) => ({
                            ...item,
                            invoiceId: id,
                        })),
                    });
                }
            }

            const updateData: Prisma.InvoiceUpdateInput = {
                patientId: data.patientId,
                encounterId: data.encounterId ?? undefined,
                status: data.status,
                totalAmount: totalAmount ?? undefined,
                notes: data.notes ?? undefined,
            };

            if (data.dueDate) {
                updateData.dueDate = new Date(data.dueDate);
            }

            return tx.invoice.update({
                where: { id },
                data: updateData,
                include: invoiceInclude,
            });
        });
    }

    async delete(id: string) {
        return prisma.invoice.delete({
            where: { id },
        });
    }
}

export const invoiceService = new InvoiceService();
