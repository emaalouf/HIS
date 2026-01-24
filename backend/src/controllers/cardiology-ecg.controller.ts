import { Request, Response } from 'express';
import { CardiologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyEcgService } from '../services/cardiology-ecg.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyEcgInput, UpdateCardiologyEcgInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyEcgs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as CardiologyTestStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const visitId = req.query.visitId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { ecgs, total } = await cardiologyEcgService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            visitId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, ecgs, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology ECGs error:', error);
        sendError(res, 'Failed to fetch cardiology ECGs', 500);
    }
};

export const getCardiologyEcgById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const ecg = await cardiologyEcgService.findById(id);

        if (!ecg) {
            sendError(res, 'Cardiology ECG not found', 404);
            return;
        }

        sendSuccess(res, ecg);
    } catch (error) {
        console.error('Get cardiology ECG error:', error);
        sendError(res, 'Failed to fetch cardiology ECG', 500);
    }
};

export const createCardiologyEcg = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyEcgInput;

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

        if (data.visitId) {
            const visit = await prisma.cardiologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Cardiology visit not found', 404);
                return;
            }
        }

        const ecg = await cardiologyEcgService.create(data);
        sendSuccess(res, ecg, 'Cardiology ECG created successfully', 201);
    } catch (error) {
        console.error('Create cardiology ECG error:', error);
        sendError(res, 'Failed to create cardiology ECG', 500);
    }
};

export const updateCardiologyEcg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyEcgInput;

        const existing = await cardiologyEcgService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology ECG not found', 404);
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

        if (data.visitId) {
            const visit = await prisma.cardiologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Cardiology visit not found', 404);
                return;
            }
        }

        const ecg = await cardiologyEcgService.update(id, data);
        sendSuccess(res, ecg, 'Cardiology ECG updated successfully');
    } catch (error) {
        console.error('Update cardiology ECG error:', error);
        sendError(res, 'Failed to update cardiology ECG', 500);
    }
};

export const deleteCardiologyEcg = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyEcgService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology ECG not found', 404);
            return;
        }

        await cardiologyEcgService.delete(id);
        sendSuccess(res, null, 'Cardiology ECG deleted successfully');
    } catch (error) {
        console.error('Delete cardiology ECG error:', error);
        sendError(res, 'Failed to delete cardiology ECG', 500);
    }
};
