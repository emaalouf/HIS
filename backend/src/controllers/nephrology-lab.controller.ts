import { Request, Response } from 'express';
import prisma from '../config/database';
import { nephrologyLabService } from '../services/nephrology-lab.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNephrologyLabInput, UpdateNephrologyLabInput } from '../utils/validators';

export const getNephrologyLabs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await nephrologyLabService.list({
            page,
            limit,
            search,
            patientId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, results, { page, limit, total });
    } catch (error) {
        console.error('Get nephrology labs error:', error);
        sendError(res, 'Failed to fetch nephrology labs', 500);
    }
};

export const getNephrologyLabById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await nephrologyLabService.findById(id);

        if (!result) {
            sendError(res, 'Nephrology lab result not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get nephrology lab error:', error);
        sendError(res, 'Failed to fetch nephrology lab result', 500);
    }
};

export const createNephrologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNephrologyLabInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await nephrologyLabService.create(data);
        sendSuccess(res, result, 'Nephrology lab result created successfully', 201);
    } catch (error) {
        console.error('Create nephrology lab error:', error);
        sendError(res, 'Failed to create nephrology lab result', 500);
    }
};

export const updateNephrologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNephrologyLabInput;

        const existing = await nephrologyLabService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology lab result not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await nephrologyLabService.update(id, data);
        sendSuccess(res, result, 'Nephrology lab result updated successfully');
    } catch (error) {
        console.error('Update nephrology lab error:', error);
        sendError(res, 'Failed to update nephrology lab result', 500);
    }
};

export const deleteNephrologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await nephrologyLabService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology lab result not found', 404);
            return;
        }

        await nephrologyLabService.delete(id);
        sendSuccess(res, null, 'Nephrology lab result deleted successfully');
    } catch (error) {
        console.error('Delete nephrology lab error:', error);
        sendError(res, 'Failed to delete nephrology lab result', 500);
    }
};
