import { Request, Response } from 'express';
import prisma from '../config/database';
import { dialysisMedicationService } from '../services/dialysis-medication.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import {
    CreateDialysisMedicationInput,
    UpdateDialysisMedicationInput,
} from '../utils/validators';

export const getDialysisMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { orders, total } = await dialysisMedicationService.list({
            page,
            limit,
            search,
            patientId,
            isActive,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis medications error:', error);
        sendError(res, 'Failed to fetch medication orders', 500);
    }
};

export const getDialysisMedicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await dialysisMedicationService.findById(id);

        if (!order) {
            sendError(res, 'Medication order not found', 404);
            return;
        }

        sendSuccess(res, order);
    } catch (error) {
        console.error('Get dialysis medication error:', error);
        sendError(res, 'Failed to fetch medication order', 500);
    }
};

export const createDialysisMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisMedicationInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const order = await dialysisMedicationService.create(data);
        sendSuccess(res, order, 'Medication order created successfully', 201);
    } catch (error) {
        console.error('Create dialysis medication error:', error);
        sendError(res, 'Failed to create medication order', 500);
    }
};

export const updateDialysisMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisMedicationInput;

        const existing = await dialysisMedicationService.findById(id);
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

        const order = await dialysisMedicationService.update(id, data);
        sendSuccess(res, order, 'Medication order updated successfully');
    } catch (error) {
        console.error('Update dialysis medication error:', error);
        sendError(res, 'Failed to update medication order', 500);
    }
};

export const deleteDialysisMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Medication order not found', 404);
            return;
        }

        await dialysisMedicationService.delete(id);
        sendSuccess(res, null, 'Medication order deleted successfully');
    } catch (error) {
        console.error('Delete dialysis medication error:', error);
        sendError(res, 'Failed to delete medication order', 500);
    }
};
