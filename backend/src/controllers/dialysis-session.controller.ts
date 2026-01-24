import { Request, Response } from 'express';
import { DialysisStatus } from '@prisma/client';
import prisma from '../config/database';
import { dialysisSessionService } from '../services/dialysis-session.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDialysisSessionInput, UpdateDialysisSessionInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDialysisSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as DialysisStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { sessions, total } = await dialysisSessionService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, sessions, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis sessions error:', error);
        sendError(res, 'Failed to fetch dialysis sessions', 500);
    }
};

export const getDialysisSessionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const session = await dialysisSessionService.findById(id);

        if (!session) {
            sendError(res, 'Dialysis session not found', 404);
            return;
        }

        sendSuccess(res, session);
    } catch (error) {
        console.error('Get dialysis session error:', error);
        sendError(res, 'Failed to fetch dialysis session', 500);
    }
};

export const createDialysisSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisSessionInput;

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

        const session = await dialysisSessionService.create(data);
        sendSuccess(res, session, 'Dialysis session created successfully', 201);
    } catch (error) {
        console.error('Create dialysis session error:', error);
        sendError(res, 'Failed to create dialysis session', 500);
    }
};

export const updateDialysisSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisSessionInput;

        const existing = await dialysisSessionService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis session not found', 404);
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

        const session = await dialysisSessionService.update(id, data);
        sendSuccess(res, session, 'Dialysis session updated successfully');
    } catch (error) {
        console.error('Update dialysis session error:', error);
        sendError(res, 'Failed to update dialysis session', 500);
    }
};

export const deleteDialysisSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisSessionService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis session not found', 404);
            return;
        }

        await dialysisSessionService.delete(id);
        sendSuccess(res, null, 'Dialysis session deleted successfully');
    } catch (error) {
        console.error('Delete dialysis session error:', error);
        sendError(res, 'Failed to delete dialysis session', 500);
    }
};
