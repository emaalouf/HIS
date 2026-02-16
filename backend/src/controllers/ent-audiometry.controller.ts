import { Request, Response } from 'express';
import prisma from '../config/database';
import { entAudiometryService } from '../services/ent-audiometry.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEntAudiometryInput, UpdateEntAudiometryInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getEntAudiometryTests = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { tests, total } = await entAudiometryService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, tests, { page, limit, total });
    } catch (error) {
        console.error('Get ENT audiometry tests error:', error);
        sendError(res, 'Failed to fetch ENT audiometry tests', 500);
    }
};

export const getEntAudiometryTestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const test = await entAudiometryService.findById(id);

        if (!test) {
            sendError(res, 'ENT audiometry test not found', 404);
            return;
        }

        sendSuccess(res, test);
    } catch (error) {
        console.error('Get ENT audiometry test error:', error);
        sendError(res, 'Failed to fetch ENT audiometry test', 500);
    }
};

export const createEntAudiometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateEntAudiometryInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            prisma.user.findUnique({ where: { id: data.providerId } }),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        const test = await entAudiometryService.create(data);
        sendSuccess(res, test, 'ENT audiometry test created successfully', 201);
    } catch (error) {
        console.error('Create ENT audiometry test error:', error);
        sendError(res, 'Failed to create ENT audiometry test', 500);
    }
};

export const updateEntAudiometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEntAudiometryInput;

        const existing = await entAudiometryService.findById(id);
        if (!existing) {
            sendError(res, 'ENT audiometry test not found', 404);
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

        const test = await entAudiometryService.update(id, data);
        sendSuccess(res, test, 'ENT audiometry test updated successfully');
    } catch (error) {
        console.error('Update ENT audiometry test error:', error);
        sendError(res, 'Failed to update ENT audiometry test', 500);
    }
};

export const deleteEntAudiometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await entAudiometryService.findById(id);
        if (!existing) {
            sendError(res, 'ENT audiometry test not found', 404);
            return;
        }

        await entAudiometryService.delete(id);
        sendSuccess(res, null, 'ENT audiometry test deleted successfully');
    } catch (error) {
        console.error('Delete ENT audiometry test error:', error);
        sendError(res, 'Failed to delete ENT audiometry test', 500);
    }
};
