import { Request, Response } from 'express';
import prisma from '../config/database';
import { cardiologyLabService } from '../services/cardiology-lab.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyLabInput, UpdateCardiologyLabInput } from '../utils/validators';

export const getCardiologyLabs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { results, total } = await cardiologyLabService.list({
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
        console.error('Get cardiology labs error:', error);
        sendError(res, 'Failed to fetch cardiology labs', 500);
    }
};

export const getCardiologyLabById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await cardiologyLabService.findById(id);

        if (!result) {
            sendError(res, 'Cardiology lab result not found', 404);
            return;
        }

        sendSuccess(res, result);
    } catch (error) {
        console.error('Get cardiology lab error:', error);
        sendError(res, 'Failed to fetch cardiology lab', 500);
    }
};

export const createCardiologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyLabInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const result = await cardiologyLabService.create(data);
        sendSuccess(res, result, 'Cardiology lab result created successfully', 201);
    } catch (error) {
        console.error('Create cardiology lab error:', error);
        sendError(res, 'Failed to create cardiology lab', 500);
    }
};

export const updateCardiologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyLabInput;

        const existing = await cardiologyLabService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology lab result not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const result = await cardiologyLabService.update(id, data);
        sendSuccess(res, result, 'Cardiology lab result updated successfully');
    } catch (error) {
        console.error('Update cardiology lab error:', error);
        sendError(res, 'Failed to update cardiology lab', 500);
    }
};

export const deleteCardiologyLab = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyLabService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology lab result not found', 404);
            return;
        }

        await cardiologyLabService.delete(id);
        sendSuccess(res, null, 'Cardiology lab result deleted successfully');
    } catch (error) {
        console.error('Delete cardiology lab error:', error);
        sendError(res, 'Failed to delete cardiology lab', 500);
    }
};
