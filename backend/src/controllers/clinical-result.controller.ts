import { Request, Response } from 'express';
import { ResultFlag, ResultStatus } from '@prisma/client';
import prisma from '../config/database';
import { clinicalResultService } from '../services/clinical-result.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateClinicalResultInput, UpdateClinicalResultInput } from '../utils/validators';

export const getClinicalResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as ResultStatus | undefined;
        const flag = req.query.flag as ResultFlag | undefined;
        const patientId = req.query.patientId as string | undefined;
        const orderId = req.query.orderId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const search = req.query.search as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await clinicalResultService.list({
            page,
            limit,
            status,
            flag,
            patientId,
            orderId,
            startDate,
            endDate,
            search,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, results, { page, limit, total });
    } catch (error) {
        console.error('Get clinical results error:', error);
        sendError(res, 'Failed to fetch clinical results', 500);
    }
};

export const getClinicalResultById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await clinicalResultService.findById(id);

        if (!result) {
            sendError(res, 'Clinical result not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get clinical result error:', error);
        sendError(res, 'Failed to fetch clinical result', 500);
    }
};

export const createClinicalResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateClinicalResultInput;

        const [order, patient] = await Promise.all([
            prisma.clinicalOrder.findUnique({ where: { id: data.orderId } }),
            prisma.patient.findUnique({ where: { id: data.patientId } }),
        ]);

        if (!order) {
            sendError(res, 'Clinical order not found', 404);
            return;
        }

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await clinicalResultService.create(data);
        sendSuccess(res, result, 'Clinical result created successfully', 201);
    } catch (error) {
        console.error('Create clinical result error:', error);
        sendError(res, 'Failed to create clinical result', 500);
    }
};

export const updateClinicalResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateClinicalResultInput;

        const existing = await clinicalResultService.findById(id);
        if (!existing) {
            sendError(res, 'Clinical result not found', 404);
            return;
        }

        if (data.orderId) {
            const order = await prisma.clinicalOrder.findUnique({ where: { id: data.orderId } });
            if (!order) {
                sendError(res, 'Clinical order not found', 404);
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

        const result = await clinicalResultService.update(id, data);
        sendSuccess(res, result, 'Clinical result updated successfully');
    } catch (error) {
        console.error('Update clinical result error:', error);
        sendError(res, 'Failed to update clinical result', 500);
    }
};

export const deleteClinicalResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await clinicalResultService.findById(id);
        if (!existing) {
            sendError(res, 'Clinical result not found', 404);
            return;
        }

        await clinicalResultService.delete(id);
        sendSuccess(res, null, 'Clinical result deleted successfully');
    } catch (error) {
        console.error('Delete clinical result error:', error);
        sendError(res, 'Failed to delete clinical result', 500);
    }
};
