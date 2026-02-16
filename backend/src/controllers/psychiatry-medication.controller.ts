import { Request, Response } from 'express';
import prisma from '../config/database';
import { psychiatryMedicationService } from '../services/psychiatry-medication.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePsychiatryMedicationInput, UpdatePsychiatryMedicationInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPsychiatryMedications = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { medications, total } = await psychiatryMedicationService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, medications, { page, limit, total });
    } catch (error) {
        console.error('Get psychiatry medications error:', error);
        sendError(res, 'Failed to fetch psychiatry medications', 500);
    }
};

export const getPsychiatryMedicationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const medication = await psychiatryMedicationService.findById(id);

        if (!medication) {
            sendError(res, 'Psychiatry medication not found', 404);
            return;
        }

        sendSuccess(res, medication);
    } catch (error) {
        console.error('Get psychiatry medication error:', error);
        sendError(res, 'Failed to fetch psychiatry medication', 500);
    }
};

export const createPsychiatryMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePsychiatryMedicationInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            data.providerId ? prisma.user.findUnique({ where: { id: data.providerId } }) : Promise.resolve(null),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId && (!provider || !providerRoles.includes(provider.role) || !provider.isActive)) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        const medication = await psychiatryMedicationService.create(data);
        sendSuccess(res, medication, 'Psychiatry medication created successfully', 201);
    } catch (error) {
        console.error('Create psychiatry medication error:', error);
        sendError(res, 'Failed to create psychiatry medication', 500);
    }
};

export const updatePsychiatryMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePsychiatryMedicationInput;

        const existing = await psychiatryMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry medication not found', 404);
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

        const medication = await psychiatryMedicationService.update(id, data);
        sendSuccess(res, medication, 'Psychiatry medication updated successfully');
    } catch (error) {
        console.error('Update psychiatry medication error:', error);
        sendError(res, 'Failed to update psychiatry medication', 500);
    }
};

export const deletePsychiatryMedication = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await psychiatryMedicationService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry medication not found', 404);
            return;
        }

        await psychiatryMedicationService.delete(id);
        sendSuccess(res, null, 'Psychiatry medication deleted successfully');
    } catch (error) {
        console.error('Delete psychiatry medication error:', error);
        sendError(res, 'Failed to delete psychiatry medication', 500);
    }
};
