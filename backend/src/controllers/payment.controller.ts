import { Request, Response } from 'express';
import { PaymentMethod } from '@prisma/client';
import prisma from '../config/database';
import { paymentService } from '../services/payment.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePaymentInput, UpdatePaymentInput } from '../utils/validators';

export const getPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const method = req.query.method as PaymentMethod | undefined;
        const patientId = req.query.patientId as string | undefined;
        const invoiceId = req.query.invoiceId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { payments, total } = await paymentService.list({
            page,
            limit,
            method,
            patientId,
            invoiceId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, payments, { page, limit, total });
    } catch (error) {
        console.error('Get payments error:', error);
        sendError(res, 'Failed to fetch payments', 500);
    }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const payment = await paymentService.findById(id);

        if (!payment) {
            sendError(res, 'Payment not found', 404);
            return;
        }

        sendSuccess(res, payment);
    } catch (error) {
        console.error('Get payment error:', error);
        sendError(res, 'Failed to fetch payment', 500);
    }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePaymentInput;

        const [invoice, patient] = await Promise.all([
            prisma.invoice.findUnique({ where: { id: data.invoiceId } }),
            prisma.patient.findUnique({ where: { id: data.patientId } }),
        ]);

        if (!invoice) {
            sendError(res, 'Invoice not found', 404);
            return;
        }

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.receivedById) {
            const user = await prisma.user.findUnique({ where: { id: data.receivedById } });
            if (!user || !user.isActive) {
                sendError(res, 'Receiving user must be active', 400);
                return;
            }
        }

        const payment = await paymentService.create(data);
        sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) {
        console.error('Create payment error:', error);
        sendError(res, 'Failed to record payment', 500);
    }
};

export const updatePayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePaymentInput;

        const existing = await paymentService.findById(id);
        if (!existing) {
            sendError(res, 'Payment not found', 404);
            return;
        }

        if (data.invoiceId) {
            const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } });
            if (!invoice) {
                sendError(res, 'Invoice not found', 404);
                return;
            }
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.receivedById) {
            const user = await prisma.user.findUnique({ where: { id: data.receivedById } });
            if (!user || !user.isActive) {
                sendError(res, 'Receiving user must be active', 400);
                return;
            }
        }

        const payment = await paymentService.update(id, data);
        sendSuccess(res, payment, 'Payment updated successfully');
    } catch (error) {
        console.error('Update payment error:', error);
        sendError(res, 'Failed to update payment', 500);
    }
};

export const deletePayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await paymentService.findById(id);
        if (!existing) {
            sendError(res, 'Payment not found', 404);
            return;
        }

        await paymentService.delete(id);
        sendSuccess(res, null, 'Payment deleted successfully');
    } catch (error) {
        console.error('Delete payment error:', error);
        sendError(res, 'Failed to delete payment', 500);
    }
};
