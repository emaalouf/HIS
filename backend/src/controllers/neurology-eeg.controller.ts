import { Request, Response } from 'express';
import { NeurologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { neurologyEegService } from '../services/neurology-eeg.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyEegInput, UpdateNeurologyEegInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyEegs = async (req: Request, res: Response): Promise<void> => {
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

        const { eegs, total } = await neurologyEegService.list({
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

        sendPaginated(res, eegs, { page, limit, total });
    } catch (error) {
        console.error('Get neurology EEGs error:', error);
        sendError(res, 'Failed to fetch neurology EEGs', 500);
    }
};

export const getNeurologyEegById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const eeg = await neurologyEegService.findById(id);

        if (!eeg) {
            sendError(res, 'Neurology EEG not found', 404);
            return;
        }

        sendSuccess(res, eeg);
    } catch (error) {
        console.error('Get neurology EEG error:', error);
        sendError(res, 'Failed to fetch neurology EEG', 500);
    }
};

export const createNeurologyEeg = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyEegInput;

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

        const eeg = await neurologyEegService.create(data);
        sendSuccess(res, eeg, 'Neurology EEG created successfully', 201);
    } catch (error) {
        console.error('Create neurology EEG error:', error);
        sendError(res, 'Failed to create neurology EEG', 500);
    }
};

export const updateNeurologyEeg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyEegInput;

        const existing = await neurologyEegService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology EEG not found', 404);
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

        const eeg = await neurologyEegService.update(id, data);
        sendSuccess(res, eeg, 'Neurology EEG updated successfully');
    } catch (error) {
        console.error('Update neurology EEG error:', error);
        sendError(res, 'Failed to update neurology EEG', 500);
    }
};

export const deleteNeurologyEeg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyEegService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology EEG not found', 404);
            return;
        }

        await neurologyEegService.delete(id);
        sendSuccess(res, null, 'Neurology EEG deleted successfully');
    } catch (error) {
        console.error('Delete neurology EEG error:', error);
        sendError(res, 'Failed to delete neurology EEG', 500);
    }
};
