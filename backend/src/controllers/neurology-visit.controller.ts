import { Request, Response } from 'express';
import { NeurologyVisitStatus } from '@prisma/client';
import prisma from '../config/database';
import { neurologyVisitService } from '../services/neurology-visit.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyVisitInput, UpdateNeurologyVisitInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NeurologyVisitStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { visits, total } = await neurologyVisitService.list({
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
        console.error('Get neurology visits error:', error);
        sendError(res, 'Failed to fetch neurology visits', 500);
    }
};

export const getNeurologyVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const visit = await neurologyVisitService.findById(id);

        if (!visit) {
            sendError(res, 'Neurology visit not found', 404);
            return;
        }

        sendSuccess(res, visit);
    } catch (error) {
        console.error('Get neurology visit error:', error);
        sendError(res, 'Failed to fetch neurology visit', 500);
    }
};

export const createNeurologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyVisitInput;

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

        const visit = await neurologyVisitService.create(data);
        sendSuccess(res, visit, 'Neurology visit created successfully', 201);
    } catch (error) {
        console.error('Create neurology visit error:', error);
        sendError(res, 'Failed to create neurology visit', 500);
    }
};

export const updateNeurologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyVisitInput;

        const existing = await neurologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology visit not found', 404);
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

        const visit = await neurologyVisitService.update(id, data);
        sendSuccess(res, visit, 'Neurology visit updated successfully');
    } catch (error) {
        console.error('Update neurology visit error:', error);
        sendError(res, 'Failed to update neurology visit', 500);
    }
};

export const deleteNeurologyVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyVisitService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology visit not found', 404);
            return;
        }

        await neurologyVisitService.delete(id);
        sendSuccess(res, null, 'Neurology visit deleted successfully');
    } catch (error) {
        console.error('Delete neurology visit error:', error);
        sendError(res, 'Failed to delete neurology visit', 500);
    }
};
