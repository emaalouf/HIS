import { Request, Response } from 'express';
import prisma from '../config/database';
import { nephrologyMedicationService } from '../services/nephrology-medication.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNephrologyMedicationInput, UpdateNephrologyMedicationInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNephrologyMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { orders, total } = await nephrologyMedicationService.list({
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
        console.error('Get nephrology medications error:', error);
        sendError(res, 'Failed to fetch nephrology medications', 500);
    }
};

export const getNephrologyMedicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const order = await nephrologyMedicationService.findById(id);

        if (!order) {
            sendError(res, 'Nephrology medication order not found', 404);
            return;
        }

        sendSuccess(res, order);
    } catch (error) {
        console.error('Get nephrology medication error:', error);
        sendError(res, 'Failed to fetch nephrology medication order', 500);
    }
};

export const createNephrologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNephrologyMedicationInput;

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

        const order = await nephrologyMedicationService.create(data);
        sendSuccess(res, order, 'Nephrology medication order created successfully', 201);
    } catch (error) {
        console.error('Create nephrology medication error:', error);
        sendError(res, 'Failed to create nephrology medication order', 500);
    }
};

export const updateNephrologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNephrologyMedicationInput;

        const existing = await nephrologyMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology medication order not found', 404);
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

        const order = await nephrologyMedicationService.update(id, data);
        sendSuccess(res, order, 'Nephrology medication order updated successfully');
    } catch (error) {
        console.error('Update nephrology medication error:', error);
        sendError(res, 'Failed to update nephrology medication order', 500);
    }
};

export const deleteNephrologyMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await nephrologyMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology medication order not found', 404);
            return;
        }

        await nephrologyMedicationService.delete(id);
        sendSuccess(res, null, 'Nephrology medication order deleted successfully');
    } catch (error) {
        console.error('Delete nephrology medication error:', error);
        sendError(res, 'Failed to delete nephrology medication order', 500);
    }
};
