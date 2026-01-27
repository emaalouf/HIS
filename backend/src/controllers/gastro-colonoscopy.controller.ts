import { Request, Response } from 'express';
import prisma from '../config/database';
import { gastroColonoscopyService } from '../services/gastro-colonoscopy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateGastroColonoscopyInput, UpdateGastroColonoscopyInput } from '../utils/validators';

export const getGastroColonoscopies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await gastroColonoscopyService.list({
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
        console.error('Get gastro colonoscopies error:', error);
        sendError(res, 'Failed to fetch gastro colonoscopies', 500);
    }
};

export const getGastroColonoscopyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await gastroColonoscopyService.findById(id);

        if (!result) {
            sendError(res, 'Gastro colonoscopy not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get gastro colonoscopy error:', error);
        sendError(res, 'Failed to fetch gastro colonoscopy', 500);
    }
};

export const createGastroColonoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateGastroColonoscopyInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await gastroColonoscopyService.create(data);
        sendSuccess(res, result, 'Gastro colonoscopy created successfully', 201);
    } catch (error) {
        console.error('Create gastro colonoscopy error:', error);
        sendError(res, 'Failed to create gastro colonoscopy', 500);
    }
};

export const updateGastroColonoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateGastroColonoscopyInput;

        const existing = await gastroColonoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro colonoscopy not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await gastroColonoscopyService.update(id, data);
        sendSuccess(res, result, 'Gastro colonoscopy updated successfully');
    } catch (error) {
        console.error('Update gastro colonoscopy error:', error);
        sendError(res, 'Failed to update gastro colonoscopy', 500);
    }
};

export const deleteGastroColonoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await gastroColonoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Gastro colonoscopy not found', 404);
            return;
        }

        await gastroColonoscopyService.delete(id);
        sendSuccess(res, null, 'Gastro colonoscopy deleted successfully');
    } catch (error) {
        console.error('Delete gastro colonoscopy error:', error);
        sendError(res, 'Failed to delete gastro colonoscopy', 500);
    }
};
