import { Request, Response } from 'express';
import { CardiologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyEchoService } from '../services/cardiology-echo.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyEchoInput, UpdateCardiologyEchoInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyEchos = async (req: Request, res: Response): Promise<void> => {
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

        const { echos, total } = await cardiologyEchoService.list({
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

        sendPaginated(res, echos, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology echos error:', error);
        sendError(res, 'Failed to fetch cardiology echos', 500);
    }
};

export const getCardiologyEchoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const echo = await cardiologyEchoService.findById(id);

        if (!echo) {
            sendError(res, 'Cardiology echo not found', 404);
            return;
        }

        sendSuccess(res, echo);
    } catch (error) {
        console.error('Get cardiology echo error:', error);
        sendError(res, 'Failed to fetch cardiology echo', 500);
    }
};

export const createCardiologyEcho = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyEchoInput;

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

        const echo = await cardiologyEchoService.create(data);
        sendSuccess(res, echo, 'Cardiology echo created successfully', 201);
    } catch (error) {
        console.error('Create cardiology echo error:', error);
        sendError(res, 'Failed to create cardiology echo', 500);
    }
};

export const updateCardiologyEcho = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyEchoInput;

        const existing = await cardiologyEchoService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology echo not found', 404);
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

        const echo = await cardiologyEchoService.update(id, data);
        sendSuccess(res, echo, 'Cardiology echo updated successfully');
    } catch (error) {
        console.error('Update cardiology echo error:', error);
        sendError(res, 'Failed to update cardiology echo', 500);
    }
};

export const deleteCardiologyEcho = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyEchoService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology echo not found', 404);
            return;
        }

        await cardiologyEchoService.delete(id);
        sendSuccess(res, null, 'Cardiology echo deleted successfully');
    } catch (error) {
        console.error('Delete cardiology echo error:', error);
        sendError(res, 'Failed to delete cardiology echo', 500);
    }
};
