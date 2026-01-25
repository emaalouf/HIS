import { Request, Response } from 'express';
import { MedicationOrderStatus } from '@prisma/client';
import prisma from '../config/database';
import { medicationOrderService } from '../services/medication-order.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateMedicationOrderInput, UpdateMedicationOrderInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getMedicationOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as MedicationOrderStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const encounterId = req.query.encounterId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { orders, total } = await medicationOrderService.list({
            page,
            limit,
            search,
            status,
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
        console.error('Get medication orders error:', error);
        sendError(res, 'Failed to fetch medication orders', 500);
    }
};

export const getMedicationOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await medicationOrderService.findById(id);

        if (!order) {
            sendError(res, 'Medication order not found', 404);
            return;
        }

        sendSuccess(res, order);
    } catch (error) {
        console.error('Get medication order error:', error);
        sendError(res, 'Failed to fetch medication order', 500);
    }
};

export const createMedicationOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateMedicationOrderInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
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

        const order = await medicationOrderService.create(data);
        sendSuccess(res, order, 'Medication order created successfully', 201);
    } catch (error) {
        console.error('Create medication order error:', error);
        sendError(res, 'Failed to create medication order', 500);
    }
};

export const updateMedicationOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateMedicationOrderInput;

        const existing = await medicationOrderService.findById(id);
        if (!existing) {
            sendError(res, 'Medication order not found', 404);
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

        const order = await medicationOrderService.update(id, data);
        sendSuccess(res, order, 'Medication order updated successfully');
    } catch (error) {
        console.error('Update medication order error:', error);
        sendError(res, 'Failed to update medication order', 500);
    }
};

export const deleteMedicationOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await medicationOrderService.findById(id);
        if (!existing) {
            sendError(res, 'Medication order not found', 404);
            return;
        }

        await medicationOrderService.delete(id);
        sendSuccess(res, null, 'Medication order deleted successfully');
    } catch (error) {
        console.error('Delete medication order error:', error);
        sendError(res, 'Failed to delete medication order', 500);
    }
};
