import { Request, Response } from 'express';
import { SeizureType } from '@prisma/client';
import prisma from '../config/database';
import { neurologySeizureService } from '../services/neurology-seizure.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologySeizureInput, UpdateNeurologySeizureInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologySeizures = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const seizureType = req.query.seizureType as SeizureType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { seizures, total } = await neurologySeizureService.list({
            page,
            limit,
            search,
            seizureType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, seizures, { page, limit, total });
    } catch (error) {
        console.error('Get neurology seizures error:', error);
        sendError(res, 'Failed to fetch neurology seizures', 500);
    }
};

export const getNeurologySeizureById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const seizure = await neurologySeizureService.findById(id);

        if (!seizure) {
            sendError(res, 'Neurology seizure not found', 404);
            return;
        }

        sendSuccess(res, seizure);
    } catch (error) {
        console.error('Get neurology seizure error:', error);
        sendError(res, 'Failed to fetch neurology seizure', 500);
    }
};

export const createNeurologySeizure = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologySeizureInput;

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

        const seizure = await neurologySeizureService.create(data);
        sendSuccess(res, seizure, 'Neurology seizure created successfully', 201);
    } catch (error) {
        console.error('Create neurology seizure error:', error);
        sendError(res, 'Failed to create neurology seizure', 500);
    }
};

export const updateNeurologySeizure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologySeizureInput;

        const existing = await neurologySeizureService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology seizure not found', 404);
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

        const seizure = await neurologySeizureService.update(id, data);
        sendSuccess(res, seizure, 'Neurology seizure updated successfully');
    } catch (error) {
        console.error('Update neurology seizure error:', error);
        sendError(res, 'Failed to update neurology seizure', 500);
    }
};

export const deleteNeurologySeizure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologySeizureService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology seizure not found', 404);
            return;
        }

        await neurologySeizureService.delete(id);
        sendSuccess(res, null, 'Neurology seizure deleted successfully');
    } catch (error) {
        console.error('Delete neurology seizure error:', error);
        sendError(res, 'Failed to delete neurology seizure', 500);
    }
};
