import { Request, Response } from 'express';
import prisma from '../config/database';
import { neurologyCognitiveService } from '../services/neurology-cognitive.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyCognitiveInput, UpdateNeurologyCognitiveInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyCognitives = async (req: Request, res: Response): Promise<void> => {
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

        const { cognitives, total } = await neurologyCognitiveService.list({
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

        sendPaginated(res, cognitives, { page, limit, total });
    } catch (error) {
        console.error('Get neurology cognitive assessments error:', error);
        sendError(res, 'Failed to fetch neurology cognitive assessments', 500);
    }
};

export const getNeurologyCognitiveById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const cognitive = await neurologyCognitiveService.findById(id);

        if (!cognitive) {
            sendError(res, 'Neurology cognitive assessment not found', 404);
            return;
        }

        sendSuccess(res, cognitive);
    } catch (error) {
        console.error('Get neurology cognitive assessment error:', error);
        sendError(res, 'Failed to fetch neurology cognitive assessment', 500);
    }
};

export const createNeurologyCognitive = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyCognitiveInput;

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

        const cognitive = await neurologyCognitiveService.create(data);
        sendSuccess(res, cognitive, 'Neurology cognitive assessment created successfully', 201);
    } catch (error) {
        console.error('Create neurology cognitive assessment error:', error);
        sendError(res, 'Failed to create neurology cognitive assessment', 500);
    }
};

export const updateNeurologyCognitive = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyCognitiveInput;

        const existing = await neurologyCognitiveService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology cognitive assessment not found', 404);
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

        const cognitive = await neurologyCognitiveService.update(id, data);
        sendSuccess(res, cognitive, 'Neurology cognitive assessment updated successfully');
    } catch (error) {
        console.error('Update neurology cognitive assessment error:', error);
        sendError(res, 'Failed to update neurology cognitive assessment', 500);
    }
};

export const deleteNeurologyCognitive = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyCognitiveService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology cognitive assessment not found', 404);
            return;
        }

        await neurologyCognitiveService.delete(id);
        sendSuccess(res, null, 'Neurology cognitive assessment deleted successfully');
    } catch (error) {
        console.error('Delete neurology cognitive assessment error:', error);
        sendError(res, 'Failed to delete neurology cognitive assessment', 500);
    }
};
