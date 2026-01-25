import { Request, Response } from 'express';
import { InvoiceStatus } from '@prisma/client';
import prisma from '../config/database';
import { invoiceService } from '../services/invoice.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../utils/validators';

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as InvoiceStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const encounterId = req.query.encounterId as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { invoices, total } = await invoiceService.list({
            page,
            limit,
            search,
            status,
            patientId,
            encounterId,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, invoices, { page, limit, total });
    } catch (error) {
        console.error('Get invoices error:', error);
        sendError(res, 'Failed to fetch invoices', 500);
    }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const invoice = await invoiceService.findById(id);

        if (!invoice) {
            sendError(res, 'Invoice not found', 404);
            return;
        }

        sendSuccess(res, invoice);
    } catch (error) {
        console.error('Get invoice error:', error);
        sendError(res, 'Failed to fetch invoice', 500);
    }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateInvoiceInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.encounterId) {
            const encounter = await prisma.encounter.findUnique({ where: { id: data.encounterId } });
            if (!encounter) {
                sendError(res, 'Encounter not found', 404);
                return;
            }
        }

        const createdById = req.user?.userId;
        const invoice = await invoiceService.create({ ...data, createdById });
        sendSuccess(res, invoice, 'Invoice created successfully', 201);
    } catch (error) {
        console.error('Create invoice error:', error);
        sendError(res, 'Failed to create invoice', 500);
    }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateInvoiceInput;

        const existing = await invoiceService.findById(id);
        if (!existing) {
            sendError(res, 'Invoice not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.encounterId) {
            const encounter = await prisma.encounter.findUnique({ where: { id: data.encounterId } });
            if (!encounter) {
                sendError(res, 'Encounter not found', 404);
                return;
            }
        }

        const invoice = await invoiceService.update(id, data);
        sendSuccess(res, invoice, 'Invoice updated successfully');
    } catch (error) {
        console.error('Update invoice error:', error);
        sendError(res, 'Failed to update invoice', 500);
    }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await invoiceService.findById(id);
        if (!existing) {
            sendError(res, 'Invoice not found', 404);
            return;
        }

        await invoiceService.delete(id);
        sendSuccess(res, null, 'Invoice deleted successfully');
    } catch (error) {
        console.error('Delete invoice error:', error);
        sendError(res, 'Failed to delete invoice', 500);
    }
};
