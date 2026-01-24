import { Request, Response } from 'express';
import prisma from '../config/database';
import { dialysisLabService } from '../services/dialysis-lab.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDialysisLabInput, UpdateDialysisLabInput } from '../utils/validators';

export const getDialysisLabs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await dialysisLabService.list({
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
        console.error('Get dialysis labs error:', error);
        sendError(res, 'Failed to fetch lab results', 500);
    }
};

export const getDialysisLabById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await dialysisLabService.findById(id);

        if (!result) {
            sendError(res, 'Lab result not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get dialysis lab error:', error);
        sendError(res, 'Failed to fetch lab result', 500);
    }
};

export const createDialysisLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisLabInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await dialysisLabService.create(data);
        sendSuccess(res, result, 'Lab result created successfully', 201);
    } catch (error) {
        console.error('Create dialysis lab error:', error);
        sendError(res, 'Failed to create lab result', 500);
    }
};

export const updateDialysisLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisLabInput;

        const existing = await dialysisLabService.findById(id);
        if (!existing) {
            sendError(res, 'Lab result not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await dialysisLabService.update(id, data);
        sendSuccess(res, result, 'Lab result updated successfully');
    } catch (error) {
        console.error('Update dialysis lab error:', error);
        sendError(res, 'Failed to update lab result', 500);
    }
};

export const deleteDialysisLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisLabService.findById(id);
        if (!existing) {
            sendError(res, 'Lab result not found', 404);
            return;
        }

        await dialysisLabService.delete(id);
        sendSuccess(res, null, 'Lab result deleted successfully');
    } catch (error) {
        console.error('Delete dialysis lab error:', error);
        sendError(res, 'Failed to delete lab result', 500);
    }
};
