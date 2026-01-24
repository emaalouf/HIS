import { Request, Response } from 'express';
import { CardiologyProcedureStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyProcedureService } from '../services/cardiology-procedure.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyProcedureInput, UpdateCardiologyProcedureInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyProcedures = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as CardiologyProcedureStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const visitId = req.query.visitId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { procedures, total } = await cardiologyProcedureService.list({
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

        sendPaginated(res, procedures, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology procedures error:', error);
        sendError(res, 'Failed to fetch cardiology procedures', 500);
    }
};

export const getCardiologyProcedureById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const procedure = await cardiologyProcedureService.findById(id);

        if (!procedure) {
            sendError(res, 'Cardiology procedure not found', 404);
            return;
        }

        sendSuccess(res, procedure);
    } catch (error) {
        console.error('Get cardiology procedure error:', error);
        sendError(res, 'Failed to fetch cardiology procedure', 500);
    }
};

export const createCardiologyProcedure = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyProcedureInput;

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

        const procedure = await cardiologyProcedureService.create(data);
        sendSuccess(res, procedure, 'Cardiology procedure created successfully', 201);
    } catch (error) {
        console.error('Create cardiology procedure error:', error);
        sendError(res, 'Failed to create cardiology procedure', 500);
    }
};

export const updateCardiologyProcedure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyProcedureInput;

        const existing = await cardiologyProcedureService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology procedure not found', 404);
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

        const procedure = await cardiologyProcedureService.update(id, data);
        sendSuccess(res, procedure, 'Cardiology procedure updated successfully');
    } catch (error) {
        console.error('Update cardiology procedure error:', error);
        sendError(res, 'Failed to update cardiology procedure', 500);
    }
};

export const deleteCardiologyProcedure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyProcedureService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology procedure not found', 404);
            return;
        }

        await cardiologyProcedureService.delete(id);
        sendSuccess(res, null, 'Cardiology procedure deleted successfully');
    } catch (error) {
        console.error('Delete cardiology procedure error:', error);
        sendError(res, 'Failed to delete cardiology procedure', 500);
    }
};
