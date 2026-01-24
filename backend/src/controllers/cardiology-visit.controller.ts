import { Request, Response } from 'express';
import { CardiologyVisitStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyVisitService } from '../services/cardiology-visit.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyVisitInput, UpdateCardiologyVisitInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as CardiologyVisitStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { visits, total } = await cardiologyVisitService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, visits, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology visits error:', error);
        sendError(res, 'Failed to fetch cardiology visits', 500);
    }
};

export const getCardiologyVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const visit = await cardiologyVisitService.findById(id);

        if (!visit) {
            sendError(res, 'Cardiology visit not found', 404);
            return;
        }

        sendSuccess(res, visit);
    } catch (error) {
        console.error('Get cardiology visit error:', error);
        sendError(res, 'Failed to fetch cardiology visit', 500);
    }
};

export const createCardiologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyVisitInput;

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

        const visit = await cardiologyVisitService.create(data);
        sendSuccess(res, visit, 'Cardiology visit created successfully', 201);
    } catch (error) {
        console.error('Create cardiology visit error:', error);
        sendError(res, 'Failed to create cardiology visit', 500);
    }
};

export const updateCardiologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyVisitInput;

        const existing = await cardiologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology visit not found', 404);
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

        const visit = await cardiologyVisitService.update(id, data);
        sendSuccess(res, visit, 'Cardiology visit updated successfully');
    } catch (error) {
        console.error('Update cardiology visit error:', error);
        sendError(res, 'Failed to update cardiology visit', 500);
    }
};

export const deleteCardiologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology visit not found', 404);
            return;
        }

        await cardiologyVisitService.delete(id);
        sendSuccess(res, null, 'Cardiology visit deleted successfully');
    } catch (error) {
        console.error('Delete cardiology visit error:', error);
        sendError(res, 'Failed to delete cardiology visit', 500);
    }
};
