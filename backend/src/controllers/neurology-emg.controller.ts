import { Request, Response } from 'express';
import { NeurologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { neurologyEmgService } from '../services/neurology-emg.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyEmgInput, UpdateNeurologyEmgInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyEmgs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NeurologyTestStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { emgs, total } = await neurologyEmgService.list({
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

        sendPaginated(res, emgs, { page, limit, total });
    } catch (error) {
        console.error('Get neurology EMGs error:', error);
        sendError(res, 'Failed to fetch neurology EMGs', 500);
    }
};

export const getNeurologyEmgById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const emg = await neurologyEmgService.findById(id);

        if (!emg) {
            sendError(res, 'Neurology EMG not found', 404);
            return;
        }

        sendSuccess(res, emg);
    } catch (error) {
        console.error('Get neurology EMG error:', error);
        sendError(res, 'Failed to fetch neurology EMG', 500);
    }
};

export const createNeurologyEmg = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyEmgInput;

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

        const emg = await neurologyEmgService.create(data);
        sendSuccess(res, emg, 'Neurology EMG created successfully', 201);
    } catch (error) {
        console.error('Create neurology EMG error:', error);
        sendError(res, 'Failed to create neurology EMG', 500);
    }
};

export const updateNeurologyEmg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyEmgInput;

        const existing = await neurologyEmgService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology EMG not found', 404);
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

        const emg = await neurologyEmgService.update(id, data);
        sendSuccess(res, emg, 'Neurology EMG updated successfully');
    } catch (error) {
        console.error('Update neurology EMG error:', error);
        sendError(res, 'Failed to update neurology EMG', 500);
    }
};

export const deleteNeurologyEmg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyEmgService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology EMG not found', 404);
            return;
        }

        await neurologyEmgService.delete(id);
        sendSuccess(res, null, 'Neurology EMG deleted successfully');
    } catch (error) {
        console.error('Delete neurology EMG error:', error);
        sendError(res, 'Failed to delete neurology EMG', 500);
    }
};
