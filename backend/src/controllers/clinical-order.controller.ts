import { Request, Response } from 'express';
import { OrderStatus, OrderType } from '@prisma/client';
import prisma from '../config/database';
import { clinicalOrderService } from '../services/clinical-order.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateClinicalOrderInput, UpdateClinicalOrderInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getClinicalOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as OrderStatus | undefined;
        const orderType = req.query.orderType as OrderType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const encounterId = req.query.encounterId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { orders, total } = await clinicalOrderService.list({
            page,
            limit,
            search,
            status,
            orderType,
            patientId,
            providerId,
            encounterId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
        console.error('Get clinical orders error:', error);
        sendError(res, 'Failed to fetch clinical orders', 500);
    }
};

export const getClinicalOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await clinicalOrderService.findById(id);

        if (!order) {
            sendError(res, 'Clinical order not found', 404);
            return;
        }

        sendSuccess(res, order);
    } catch (error) {
        console.error('Get clinical order error:', error);
        sendError(res, 'Failed to fetch clinical order', 500);
    }
};

export const createClinicalOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateClinicalOrderInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            prisma.user.findUnique({ where: { id: data.providerId } }),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        if (data.encounterId) {
            const encounter = await prisma.encounter.findUnique({ where: { id: data.encounterId } });
            if (!encounter) {
                sendError(res, 'Encounter not found', 404);
                return;
            }
        }

        const order = await clinicalOrderService.create(data);
        sendSuccess(res, order, 'Clinical order created successfully', 201);
    } catch (error) {
        console.error('Create clinical order error:', error);
        sendError(res, 'Failed to create clinical order', 500);
    }
};

export const updateClinicalOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateClinicalOrderInput;

        const existing = await clinicalOrderService.findById(id);
        if (!existing) {
            sendError(res, 'Clinical order not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.providerId) {
            const provider = await prisma.user.findUnique({ where: { id: data.providerId } });
            if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
                sendError(res, 'Provider must be an active clinician', 400);
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

        const order = await clinicalOrderService.update(id, data);
        sendSuccess(res, order, 'Clinical order updated successfully');
    } catch (error) {
        console.error('Update clinical order error:', error);
        sendError(res, 'Failed to update clinical order', 500);
    }
};

export const deleteClinicalOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await clinicalOrderService.findById(id);
        if (!existing) {
            sendError(res, 'Clinical order not found', 404);
            return;
        }

        await clinicalOrderService.delete(id);
        sendSuccess(res, null, 'Clinical order deleted successfully');
    } catch (error) {
        console.error('Delete clinical order error:', error);
        sendError(res, 'Failed to delete clinical order', 500);
    }
};
