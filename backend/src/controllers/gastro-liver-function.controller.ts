import { Request, Response } from 'express';
import prisma from '../config/database';
import { gastroLiverFunctionService } from '../services/gastro-liver-function.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateGastroLiverFunctionInput, UpdateGastroLiverFunctionInput } from '../utils/validators';

export const getGastroLiverFunctions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await gastroLiverFunctionService.list({
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
        console.error('Get gastro liver functions error:', error);
        sendError(res, 'Failed to fetch gastro liver functions', 500);
    }
};

export const getGastroLiverFunctionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await gastroLiverFunctionService.findById(id);

        if (!result) {
            sendError(res, 'Gastro liver function not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get gastro liver function error:', error);
        sendError(res, 'Failed to fetch gastro liver function', 500);
    }
};

export const createGastroLiverFunction = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateGastroLiverFunctionInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await gastroLiverFunctionService.create(data);
        sendSuccess(res, result, 'Gastro liver function created successfully', 201);
    } catch (error) {
        console.error('Create gastro liver function error:', error);
        sendError(res, 'Failed to create gastro liver function', 500);
    }
};

export const updateGastroLiverFunction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateGastroLiverFunctionInput;

        const existing = await gastroLiverFunctionService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro liver function not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await gastroLiverFunctionService.update(id, data);
        sendSuccess(res, result, 'Gastro liver function updated successfully');
    } catch (error) {
        console.error('Update gastro liver function error:', error);
        sendError(res, 'Failed to update gastro liver function', 500);
    }
};

export const deleteGastroLiverFunction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await gastroLiverFunctionService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro liver function not found', 404);
            return;
        }

        await gastroLiverFunctionService.delete(id);
        sendSuccess(res, null, 'Gastro liver function deleted successfully');
    } catch (error) {
        console.error('Delete gastro liver function error:', error);
        sendError(res, 'Failed to delete gastro liver function', 500);
    }
};
