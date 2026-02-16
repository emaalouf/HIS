import { Request, Response } from 'express';
import prisma from '../config/database';
import { dermatologyBiopsyService } from '../services/dermatology-biopsy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDermBiopsyInput, UpdateDermBiopsyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDermBiopsies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const biopsyType = req.query.biopsyType as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { biopsies, total } = await dermatologyBiopsyService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            biopsyType,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, biopsies, { page, limit, total });
    } catch (error) {
        console.error('Get dermatology biopsies error:', error);
        sendError(res, 'Failed to fetch dermatology biopsies', 500);
    }
};

export const getDermBiopsyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const biopsy = await dermatologyBiopsyService.findById(id);

        if (!biopsy) {
            sendError(res, 'Dermatology biopsy not found', 404);
            return;
        }

        sendSuccess(res, biopsy);
    } catch (error) {
        console.error('Get dermatology biopsy error:', error);
        sendError(res, 'Failed to fetch dermatology biopsy', 500);
    }
};

export const createDermBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDermBiopsyInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            data.providerId ? prisma.user.findUnique({ where: { id: data.providerId } }) : Promise.resolve(null),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId && (!provider || !providerRoles.includes(provider.role) || !provider.isActive)) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        const biopsy = await dermatologyBiopsyService.create(data);
        sendSuccess(res, biopsy, 'Dermatology biopsy created successfully', 201);
    } catch (error) {
        console.error('Create dermatology biopsy error:', error);
        sendError(res, 'Failed to create dermatology biopsy', 500);
    }
};

export const updateDermBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDermBiopsyInput;

        const existing = await dermatologyBiopsyService.findById(id);
        if (!existing) {
            sendError(res, 'Dermatology biopsy not found', 404);
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

        const biopsy = await dermatologyBiopsyService.update(id, data);
        sendSuccess(res, biopsy, 'Dermatology biopsy updated successfully');
    } catch (error) {
        console.error('Update dermatology biopsy error:', error);
        sendError(res, 'Failed to update dermatology biopsy', 500);
    }
};

export const deleteDermBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dermatologyBiopsyService.findById(id);
        if (!existing) {
            sendError(res, 'Dermatology biopsy not found', 404);
            return;
        }

        await dermatologyBiopsyService.delete(id);
        sendSuccess(res, null, 'Dermatology biopsy deleted successfully');
    } catch (error) {
        console.error('Delete dermatology biopsy error:', error);
        sendError(res, 'Failed to delete dermatology biopsy', 500);
    }
};
