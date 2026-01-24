import { Request, Response } from 'express';
import prisma from '../config/database';
import { cardiologyMedicationService } from '../services/cardiology-medication.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyMedicationInput, UpdateCardiologyMedicationInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { orders, total } = await cardiologyMedicationService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            isActive,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, orders, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology medications error:', error);
        sendError(res, 'Failed to fetch cardiology medications', 500);
    }
};

export const getCardiologyMedicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await cardiologyMedicationService.findById(id);

        if (!order) {
            sendError(res, 'Cardiology medication order not found', 404);
            return;
        }

        sendSuccess(res, order);
    } catch (error) {
        console.error('Get cardiology medication error:', error);
        sendError(res, 'Failed to fetch cardiology medication', 500);
    }
};

export const createCardiologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyMedicationInput;

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

        const order = await cardiologyMedicationService.create(data);
        sendSuccess(res, order, 'Cardiology medication order created successfully', 201);
    } catch (error) {
        console.error('Create cardiology medication error:', error);
        sendError(res, 'Failed to create cardiology medication', 500);
    }
};

export const updateCardiologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyMedicationInput;

        const existing = await cardiologyMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology medication order not found', 404);
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

        const order = await cardiologyMedicationService.update(id, data);
        sendSuccess(res, order, 'Cardiology medication order updated successfully');
    } catch (error) {
        console.error('Update cardiology medication error:', error);
        sendError(res, 'Failed to update cardiology medication', 500);
    }
};

export const deleteCardiologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology medication order not found', 404);
            return;
        }

        await cardiologyMedicationService.delete(id);
        sendSuccess(res, null, 'Cardiology medication order deleted successfully');
    } catch (error) {
        console.error('Delete cardiology medication error:', error);
        sendError(res, 'Failed to delete cardiology medication', 500);
    }
};
