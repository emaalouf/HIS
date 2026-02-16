import { Request, Response } from 'express';
import { NeurologyTestStatus, NeurologyImagingType } from '@prisma/client';
import prisma from '../config/database';
import { neurologyImagingService } from '../services/neurology-imaging.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyImagingInput, UpdateNeurologyImagingInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyImagings = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NeurologyTestStatus | undefined;
        const imagingType = req.query.imagingType as NeurologyImagingType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { imagings, total } = await neurologyImagingService.list({
            page,
            limit,
            search,
            status,
            imagingType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, imagings, { page, limit, total });
    } catch (error) {
        console.error('Get neurology imagings error:', error);
        sendError(res, 'Failed to fetch neurology imagings', 500);
    }
};

export const getNeurologyImagingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const imaging = await neurologyImagingService.findById(id);

        if (!imaging) {
            sendError(res, 'Neurology imaging not found', 404);
            return;
        }

        sendSuccess(res, imaging);
    } catch (error) {
        console.error('Get neurology imaging error:', error);
        sendError(res, 'Failed to fetch neurology imaging', 500);
    }
};

export const createNeurologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyImagingInput;

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

        const imaging = await neurologyImagingService.create(data);
        sendSuccess(res, imaging, 'Neurology imaging created successfully', 201);
    } catch (error) {
        console.error('Create neurology imaging error:', error);
        sendError(res, 'Failed to create neurology imaging', 500);
    }
};

export const updateNeurologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyImagingInput;

        const existing = await neurologyImagingService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology imaging not found', 404);
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

        const imaging = await neurologyImagingService.update(id, data);
        sendSuccess(res, imaging, 'Neurology imaging updated successfully');
    } catch (error) {
        console.error('Update neurology imaging error:', error);
        sendError(res, 'Failed to update neurology imaging', 500);
    }
};

export const deleteNeurologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyImagingService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology imaging not found', 404);
            return;
        }

        await neurologyImagingService.delete(id);
        sendSuccess(res, null, 'Neurology imaging deleted successfully');
    } catch (error) {
        console.error('Delete neurology imaging error:', error);
        sendError(res, 'Failed to delete neurology imaging', 500);
    }
};
