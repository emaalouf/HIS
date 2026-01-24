import { Request, Response } from 'express';
import { NephrologyProcedureStatus } from '@prisma/client';
import prisma from '../config/database';
import { nephrologyBiopsyService } from '../services/nephrology-biopsy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNephrologyBiopsyInput, UpdateNephrologyBiopsyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNephrologyBiopsies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NephrologyProcedureStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const visitId = req.query.visitId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { biopsies, total } = await nephrologyBiopsyService.list({
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

        sendPaginated(res, biopsies, { page, limit, total });
    } catch (error) {
        console.error('Get nephrology biopsies error:', error);
        sendError(res, 'Failed to fetch nephrology biopsies', 500);
    }
};

export const getNephrologyBiopsyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const biopsy = await nephrologyBiopsyService.findById(id);

        if (!biopsy) {
            sendError(res, 'Nephrology biopsy not found', 404);
            return;
        }

        sendSuccess(res, biopsy);
    } catch (error) {
        console.error('Get nephrology biopsy error:', error);
        sendError(res, 'Failed to fetch nephrology biopsy', 500);
    }
};

export const createNephrologyBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNephrologyBiopsyInput;

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
            const visit = await prisma.nephrologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Nephrology visit not found', 404);
                return;
            }
        }

        const biopsy = await nephrologyBiopsyService.create(data);
        sendSuccess(res, biopsy, 'Nephrology biopsy created successfully', 201);
    } catch (error) {
        console.error('Create nephrology biopsy error:', error);
        sendError(res, 'Failed to create nephrology biopsy', 500);
    }
};

export const updateNephrologyBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNephrologyBiopsyInput;

        const existing = await nephrologyBiopsyService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology biopsy not found', 404);
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
            const visit = await prisma.nephrologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Nephrology visit not found', 404);
                return;
            }
        }

        const biopsy = await nephrologyBiopsyService.update(id, data);
        sendSuccess(res, biopsy, 'Nephrology biopsy updated successfully');
    } catch (error) {
        console.error('Update nephrology biopsy error:', error);
        sendError(res, 'Failed to update nephrology biopsy', 500);
    }
};

export const deleteNephrologyBiopsy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await nephrologyBiopsyService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology biopsy not found', 404);
            return;
        }

        await nephrologyBiopsyService.delete(id);
        sendSuccess(res, null, 'Nephrology biopsy deleted successfully');
    } catch (error) {
        console.error('Delete nephrology biopsy error:', error);
        sendError(res, 'Failed to delete nephrology biopsy', 500);
    }
};
