import { Request, Response } from 'express';
import { InsulinType } from '@prisma/client';
import prisma from '../config/database';
import { endocrinologyInsulinService } from '../services/endocrinology-insulin.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEndocrinologyInsulinInput, UpdateEndocrinologyInsulinInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getInsulinPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const insulinType = req.query.insulinType as InsulinType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { prescriptions, total } = await endocrinologyInsulinService.list({
            page,
            limit,
            search,
            insulinType,
            patientId,
            providerId,
            isActive,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, prescriptions, { page, limit, total });
    } catch (error) {
        console.error('Get insulin prescriptions error:', error);
        sendError(res, 'Failed to fetch insulin prescriptions', 500);
    }
};

export const getInsulinPrescriptionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const prescription = await endocrinologyInsulinService.findById(id);

        if (!prescription) {
            sendError(res, 'Insulin prescription not found', 404);
            return;
        }

        sendSuccess(res, prescription);
    } catch (error) {
        console.error('Get insulin prescription error:', error);
        sendError(res, 'Failed to fetch insulin prescription', 500);
    }
};

export const createInsulinPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateEndocrinologyInsulinInput;

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

        const prescription = await endocrinologyInsulinService.create(data);
        sendSuccess(res, prescription, 'Insulin prescription created successfully', 201);
    } catch (error) {
        console.error('Create insulin prescription error:', error);
        sendError(res, 'Failed to create insulin prescription', 500);
    }
};

export const updateInsulinPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEndocrinologyInsulinInput;

        const existing = await endocrinologyInsulinService.findById(id);
        if (!existing) {
            sendError(res, 'Insulin prescription not found', 404);
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

        const prescription = await endocrinologyInsulinService.update(id, data);
        sendSuccess(res, prescription, 'Insulin prescription updated successfully');
    } catch (error) {
        console.error('Update insulin prescription error:', error);
        sendError(res, 'Failed to update insulin prescription', 500);
    }
};

export const deleteInsulinPrescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await endocrinologyInsulinService.findById(id);
        if (!existing) {
            sendError(res, 'Insulin prescription not found', 404);
            return;
        }

        await endocrinologyInsulinService.delete(id);
        sendSuccess(res, null, 'Insulin prescription deleted successfully');
    } catch (error) {
        console.error('Delete insulin prescription error:', error);
        sendError(res, 'Failed to delete insulin prescription', 500);
    }
};
