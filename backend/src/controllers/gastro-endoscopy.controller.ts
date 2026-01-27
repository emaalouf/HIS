import { Request, Response } from 'express';
import prisma from '../config/database';
import { gastroEndoscopyService } from '../services/gastro-endoscopy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateGastroEndoscopyInput, UpdateGastroEndoscopyInput } from '../utils/validators';

export const getGastroEndoscopies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await gastroEndoscopyService.list({
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
        console.error('Get gastro endoscopies error:', error);
        sendError(res, 'Failed to fetch gastro endoscopies', 500);
    }
};

export const getGastroEndoscopyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await gastroEndoscopyService.findById(id);

        if (!result) {
            sendError(res, 'Gastro endoscopy not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get gastro endoscopy error:', error);
        sendError(res, 'Failed to fetch gastro endoscopy', 500);
    }
};

export const createGastroEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateGastroEndoscopyInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await gastroEndoscopyService.create(data);
        sendSuccess(res, result, 'Gastro endoscopy created successfully', 201);
    } catch (error) {
        console.error('Create gastro endoscopy error:', error);
        sendError(res, 'Failed to create gastro endoscopy', 500);
    }
};

export const updateGastroEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateGastroEndoscopyInput;

        const existing = await gastroEndoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro endoscopy not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await gastroEndoscopyService.update(id, data);
        sendSuccess(res, result, 'Gastro endoscopy updated successfully');
    } catch (error) {
        console.error('Update gastro endoscopy error:', error);
        sendError(res, 'Failed to update gastro endoscopy', 500);
    }
};

export const deleteGastroEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await gastroEndoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro endoscopy not found', 404);
            return;
        }

        await gastroEndoscopyService.delete(id);
        sendSuccess(res, null, 'Gastro endoscopy deleted successfully');
    } catch (error) {
        console.error('Delete gastro endoscopy error:', error);
        sendError(res, 'Failed to delete gastro endoscopy', 500);
    }
};
