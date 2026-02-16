import { Request, Response } from 'express';
import prisma from '../config/database';
import { dermatologyLesionService } from '../services/dermatology-lesion.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDermLesionInput, UpdateDermLesionInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDermLesions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const lesionType = req.query.lesionType as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { lesions, total } = await dermatologyLesionService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            lesionType,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, lesions, { page, limit, total });
    } catch (error) {
        console.error('Get dermatology lesions error:', error);
        sendError(res, 'Failed to fetch dermatology lesions', 500);
    }
};

export const getDermLesionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const lesion = await dermatologyLesionService.findById(id);

        if (!lesion) {
            sendError(res, 'Dermatology lesion not found', 404);
            return;
        }

        sendSuccess(res, lesion);
    } catch (error) {
        console.error('Get dermatology lesion error:', error);
        sendError(res, 'Failed to fetch dermatology lesion', 500);
    }
};

export const createDermLesion = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDermLesionInput;

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

        const lesion = await dermatologyLesionService.create(data);
        sendSuccess(res, lesion, 'Dermatology lesion created successfully', 201);
    } catch (error) {
        console.error('Create dermatology lesion error:', error);
        sendError(res, 'Failed to create dermatology lesion', 500);
    }
};

export const updateDermLesion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDermLesionInput;

        const existing = await dermatologyLesionService.findById(id);
        if (!existing) {
            sendError(res, 'Dermatology lesion not found', 404);
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

        const lesion = await dermatologyLesionService.update(id, data);
        sendSuccess(res, lesion, 'Dermatology lesion updated successfully');
    } catch (error) {
        console.error('Update dermatology lesion error:', error);
        sendError(res, 'Failed to update dermatology lesion', 500);
    }
};

export const deleteDermLesion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dermatologyLesionService.findById(id);
        if (!existing) {
            sendError(res, 'Dermatology lesion not found', 404);
            return;
        }

        await dermatologyLesionService.delete(id);
        sendSuccess(res, null, 'Dermatology lesion deleted successfully');
    } catch (error) {
        console.error('Delete dermatology lesion error:', error);
        sendError(res, 'Failed to delete dermatology lesion', 500);
    }
};
