import { Request, Response } from 'express';
import prisma from '../config/database';
import { pedsVaccinationService } from '../services/pediatrics-vaccination.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePedsVaccinationInput, UpdatePedsVaccinationInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPedsVaccinations = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const vaccineName = req.query.vaccineName as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { vaccinations, total } = await pedsVaccinationService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            vaccineName,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, vaccinations, { page, limit, total });
    } catch (error) {
        console.error('Get pediatrics vaccinations error:', error);
        sendError(res, 'Failed to fetch pediatrics vaccinations', 500);
    }
};

export const getPedsVaccinationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const vaccination = await pedsVaccinationService.findById(id);

        if (!vaccination) {
            sendError(res, 'Pediatrics vaccination not found', 404);
            return;
        }

        sendSuccess(res, vaccination);
    } catch (error) {
        console.error('Get pediatrics vaccination error:', error);
        sendError(res, 'Failed to fetch pediatrics vaccination', 500);
    }
};

export const createPedsVaccination = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePedsVaccinationInput;

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

        const vaccination = await pedsVaccinationService.create(data);
        sendSuccess(res, vaccination, 'Pediatrics vaccination created successfully', 201);
    } catch (error) {
        console.error('Create pediatrics vaccination error:', error);
        sendError(res, 'Failed to create pediatrics vaccination', 500);
    }
};

export const updatePedsVaccination = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePedsVaccinationInput;

        const existing = await pedsVaccinationService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics vaccination not found', 404);
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

        const vaccination = await pedsVaccinationService.update(id, data);
        sendSuccess(res, vaccination, 'Pediatrics vaccination updated successfully');
    } catch (error) {
        console.error('Update pediatrics vaccination error:', error);
        sendError(res, 'Failed to update pediatrics vaccination', 500);
    }
};

export const deletePedsVaccination = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pedsVaccinationService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics vaccination not found', 404);
            return;
        }

        await pedsVaccinationService.delete(id);
        sendSuccess(res, null, 'Pediatrics vaccination deleted successfully');
    } catch (error) {
        console.error('Delete pediatrics vaccination error:', error);
        sendError(res, 'Failed to delete pediatrics vaccination', 500);
    }
};
