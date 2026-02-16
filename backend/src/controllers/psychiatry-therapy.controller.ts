import { Request, Response } from 'express';
import prisma from '../config/database';
import { psychiatryTherapyService } from '../services/psychiatry-therapy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePsychiatryTherapyInput, UpdatePsychiatryTherapyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPsychiatryTherapySessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const therapyType = req.query.therapyType as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { sessions, total } = await psychiatryTherapyService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            therapyType,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, sessions, { page, limit, total });
    } catch (error) {
        console.error('Get psychiatry therapy sessions error:', error);
        sendError(res, 'Failed to fetch psychiatry therapy sessions', 500);
    }
};

export const getPsychiatryTherapySessionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const session = await psychiatryTherapyService.findById(id);

        if (!session) {
            sendError(res, 'Psychiatry therapy session not found', 404);
            return;
        }

        sendSuccess(res, session);
    } catch (error) {
        console.error('Get psychiatry therapy session error:', error);
        sendError(res, 'Failed to fetch psychiatry therapy session', 500);
    }
};

export const createPsychiatryTherapySession = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePsychiatryTherapyInput;

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

        const session = await psychiatryTherapyService.create(data);
        sendSuccess(res, session, 'Psychiatry therapy session created successfully', 201);
    } catch (error) {
        console.error('Create psychiatry therapy session error:', error);
        sendError(res, 'Failed to create psychiatry therapy session', 500);
    }
};

export const updatePsychiatryTherapySession = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePsychiatryTherapyInput;

        const existing = await psychiatryTherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry therapy session not found', 404);
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

        const session = await psychiatryTherapyService.update(id, data);
        sendSuccess(res, session, 'Psychiatry therapy session updated successfully');
    } catch (error) {
        console.error('Update psychiatry therapy session error:', error);
        sendError(res, 'Failed to update psychiatry therapy session', 500);
    }
};

export const deletePsychiatryTherapySession = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await psychiatryTherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry therapy session not found', 404);
            return;
        }

        await psychiatryTherapyService.delete(id);
        sendSuccess(res, null, 'Psychiatry therapy session deleted successfully');
    } catch (error) {
        console.error('Delete psychiatry therapy session error:', error);
        sendError(res, 'Failed to delete psychiatry therapy session', 500);
    }
};
