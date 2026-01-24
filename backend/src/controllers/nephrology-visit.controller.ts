import { Request, Response } from 'express';
import { CkdStage, NephrologyVisitStatus } from '@prisma/client';
import prisma from '../config/database';
import { nephrologyVisitService } from '../services/nephrology-visit.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNephrologyVisitInput, UpdateNephrologyVisitInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNephrologyVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NephrologyVisitStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const ckdStage = req.query.ckdStage as CkdStage | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { visits, total } = await nephrologyVisitService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            ckdStage,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, visits, { page, limit, total });
    } catch (error) {
        console.error('Get nephrology visits error:', error);
        sendError(res, 'Failed to fetch nephrology visits', 500);
    }
};

export const getNephrologyVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const visit = await nephrologyVisitService.findById(id);

        if (!visit) {
            sendError(res, 'Nephrology visit not found', 404);
            return;
        }

        sendSuccess(res, visit);
    } catch (error) {
        console.error('Get nephrology visit error:', error);
        sendError(res, 'Failed to fetch nephrology visit', 500);
    }
};

export const createNephrologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNephrologyVisitInput;

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

        const visit = await nephrologyVisitService.create(data);
        sendSuccess(res, visit, 'Nephrology visit created successfully', 201);
    } catch (error) {
        console.error('Create nephrology visit error:', error);
        sendError(res, 'Failed to create nephrology visit', 500);
    }
};

export const updateNephrologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNephrologyVisitInput;

        const existing = await nephrologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology visit not found', 404);
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

        const visit = await nephrologyVisitService.update(id, data);
        sendSuccess(res, visit, 'Nephrology visit updated successfully');
    } catch (error) {
        console.error('Update nephrology visit error:', error);
        sendError(res, 'Failed to update nephrology visit', 500);
    }
};

export const deleteNephrologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await nephrologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology visit not found', 404);
            return;
        }

        await nephrologyVisitService.delete(id);
        sendSuccess(res, null, 'Nephrology visit deleted successfully');
    } catch (error) {
        console.error('Delete nephrology visit error:', error);
        sendError(res, 'Failed to delete nephrology visit', 500);
    }
};
