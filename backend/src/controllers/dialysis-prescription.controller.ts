import { Request, Response } from 'express';
import prisma from '../config/database';
import { dialysisPrescriptionService } from '../services/dialysis-prescription.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import {
    CreateDialysisPrescriptionInput,
    UpdateDialysisPrescriptionInput,
} from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDialysisPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { prescriptions, total } = await dialysisPrescriptionService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, prescriptions, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis prescriptions error:', error);
        sendError(res, 'Failed to fetch dialysis prescriptions', 500);
    }
};

export const getDialysisPrescriptionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const prescription = await dialysisPrescriptionService.findById(id);

        if (!prescription) {
            sendError(res, 'Dialysis prescription not found', 404);
            return;
        }

        sendSuccess(res, prescription);
    } catch (error) {
        console.error('Get dialysis prescription error:', error);
        sendError(res, 'Failed to fetch dialysis prescription', 500);
    }
};

export const createDialysisPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisPrescriptionInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId) {
            const provider = await prisma.user.findUnique({ where: { id: data.providerId } });
            if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
                sendError(res, 'Provider must be an active clinician', 400);
                return;
            }
        }

        const prescription = await dialysisPrescriptionService.create(data);
        sendSuccess(res, prescription, 'Dialysis prescription created successfully', 201);
    } catch (error) {
        console.error('Create dialysis prescription error:', error);
        sendError(res, 'Failed to create dialysis prescription', 500);
    }
};

export const updateDialysisPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisPrescriptionInput;

        const existing = await dialysisPrescriptionService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis prescription not found', 404);
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

        const prescription = await dialysisPrescriptionService.update(id, data);
        sendSuccess(res, prescription, 'Dialysis prescription updated successfully');
    } catch (error) {
        console.error('Update dialysis prescription error:', error);
        sendError(res, 'Failed to update dialysis prescription', 500);
    }
};

export const deleteDialysisPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisPrescriptionService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis prescription not found', 404);
            return;
        }

        await dialysisPrescriptionService.delete(id);
        sendSuccess(res, null, 'Dialysis prescription deleted successfully');
    } catch (error) {
        console.error('Delete dialysis prescription error:', error);
        sendError(res, 'Failed to delete dialysis prescription', 500);
    }
};
