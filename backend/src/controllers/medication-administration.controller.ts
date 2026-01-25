import { Request, Response } from 'express';
import { MedicationAdministrationStatus } from '@prisma/client';
import prisma from '../config/database';
import { medicationAdministrationService } from '../services/medication-administration.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateMedicationAdministrationInput, UpdateMedicationAdministrationInput } from '../utils/validators';

export const getMedicationAdministrations = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as MedicationAdministrationStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const medicationOrderId = req.query.medicationOrderId as string | undefined;
        const administeredById = req.query.administeredById as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { administrations, total } = await medicationAdministrationService.list({
            page,
            limit,
            status,
            patientId,
            medicationOrderId,
            administeredById,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, administrations, { page, limit, total });
    } catch (error) {
        console.error('Get medication administrations error:', error);
        sendError(res, 'Failed to fetch medication administrations', 500);
    }
};

export const getMedicationAdministrationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const administration = await medicationAdministrationService.findById(id);

        if (!administration) {
            sendError(res, 'Medication administration not found', 404);
            return;
        }

        sendSuccess(res, administration);
    } catch (error) {
        console.error('Get medication administration error:', error);
        sendError(res, 'Failed to fetch medication administration', 500);
    }
};

export const createMedicationAdministration = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateMedicationAdministrationInput;

        const [order, patient] = await Promise.all([
            prisma.medicationOrder.findUnique({ where: { id: data.medicationOrderId } }),
            prisma.patient.findUnique({ where: { id: data.patientId } }),
        ]);

        if (!order) {
            sendError(res, 'Medication order not found', 404);
            return;
        }

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.administeredById) {
            const adminUser = await prisma.user.findUnique({ where: { id: data.administeredById } });
            if (!adminUser || !adminUser.isActive) {
                sendError(res, 'Administering user must be active', 400);
                return;
            }
        }

        const administration = await medicationAdministrationService.create(data);
        sendSuccess(res, administration, 'Medication administration created successfully', 201);
    } catch (error) {
        console.error('Create medication administration error:', error);
        sendError(res, 'Failed to create medication administration', 500);
    }
};

export const updateMedicationAdministration = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateMedicationAdministrationInput;

        const existing = await medicationAdministrationService.findById(id);
        if (!existing) {
            sendError(res, 'Medication administration not found', 404);
            return;
        }

        if (data.medicationOrderId) {
            const order = await prisma.medicationOrder.findUnique({ where: { id: data.medicationOrderId } });
            if (!order) {
                sendError(res, 'Medication order not found', 404);
                return;
            }
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.administeredById) {
            const adminUser = await prisma.user.findUnique({ where: { id: data.administeredById } });
            if (!adminUser || !adminUser.isActive) {
                sendError(res, 'Administering user must be active', 400);
                return;
            }
        }

        const administration = await medicationAdministrationService.update(id, data);
        sendSuccess(res, administration, 'Medication administration updated successfully');
    } catch (error) {
        console.error('Update medication administration error:', error);
        sendError(res, 'Failed to update medication administration', 500);
    }
};

export const deleteMedicationAdministration = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await medicationAdministrationService.findById(id);
        if (!existing) {
            sendError(res, 'Medication administration not found', 404);
            return;
        }

        await medicationAdministrationService.delete(id);
        sendSuccess(res, null, 'Medication administration deleted successfully');
    } catch (error) {
        console.error('Delete medication administration error:', error);
        sendError(res, 'Failed to delete medication administration', 500);
    }
};
