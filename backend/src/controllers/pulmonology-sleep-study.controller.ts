import { Request, Response } from 'express';
import { SleepApneaSeverity } from '@prisma/client';
import prisma from '../config/database';
import { pulmonologySleepStudyService } from '../services/pulmonology-sleep-study.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePulmonologySleepStudyInput, UpdatePulmonologySleepStudyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getSleepStudies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const severity = req.query.severity as SleepApneaSeverity | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { studies, total } = await pulmonologySleepStudyService.list({
            page,
            limit,
            search,
            severity,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, studies, { page, limit, total });
    } catch (error) {
        console.error('Get sleep studies error:', error);
        sendError(res, 'Failed to fetch sleep studies', 500);
    }
};

export const getSleepStudyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const study = await pulmonologySleepStudyService.findById(id);

        if (!study) {
            sendError(res, 'Sleep study not found', 404);
            return;
        }

        sendSuccess(res, study);
    } catch (error) {
        console.error('Get sleep study error:', error);
        sendError(res, 'Failed to fetch sleep study', 500);
    }
};

export const createSleepStudy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePulmonologySleepStudyInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            data.providerId ? prisma.user.findUnique({ where: { id: data.providerId } }) : Promise.resolve(null),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId && provider && (!providerRoles.includes(provider.role) || !provider.isActive)) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        const study = await pulmonologySleepStudyService.create(data);
        sendSuccess(res, study, 'Sleep study created successfully', 201);
    } catch (error) {
        console.error('Create sleep study error:', error);
        sendError(res, 'Failed to create sleep study', 500);
    }
};

export const updateSleepStudy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePulmonologySleepStudyInput;

        const existing = await pulmonologySleepStudyService.findById(id);
        if (!existing) {
            sendError(res, 'Sleep study not found', 404);
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
            if (provider && (!providerRoles.includes(provider.role) || !provider.isActive)) {
                sendError(res, 'Provider must be an active clinician', 400);
                return;
            }
        }

        const study = await pulmonologySleepStudyService.update(id, data);
        sendSuccess(res, study, 'Sleep study updated successfully');
    } catch (error) {
        console.error('Update sleep study error:', error);
        sendError(res, 'Failed to update sleep study', 500);
    }
};

export const deleteSleepStudy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pulmonologySleepStudyService.findById(id);
        if (!existing) {
            sendError(res, 'Sleep study not found', 404);
            return;
        }

        await pulmonologySleepStudyService.delete(id);
        sendSuccess(res, null, 'Sleep study deleted successfully');
    } catch (error) {
        console.error('Delete sleep study error:', error);
        sendError(res, 'Failed to delete sleep study', 500);
    }
};
