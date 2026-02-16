import { Request, Response } from 'express';
import { PregnancyStatus, DeliveryMode } from '@prisma/client';
import prisma from '../config/database';
import { obgynPregnancyService } from '../services/obgyn-pregnancy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateObgynPregnancyInput, UpdateObgynPregnancyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getObgynPregnancies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as PregnancyStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { pregnancies, total } = await obgynPregnancyService.list({
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

        sendPaginated(res, pregnancies, { page, limit, total });
    } catch (error) {
        console.error('Get OBGYN pregnancies error:', error);
        sendError(res, 'Failed to fetch OBGYN pregnancies', 500);
    }
};

export const getObgynPregnancyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const pregnancy = await obgynPregnancyService.findById(id);

        if (!pregnancy) {
            sendError(res, 'OBGYN pregnancy not found', 404);
            return;
        }

        sendSuccess(res, pregnancy);
    } catch (error) {
        console.error('Get OBGYN pregnancy error:', error);
        sendError(res, 'Failed to fetch OBGYN pregnancy', 500);
    }
};

export const createObgynPregnancy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateObgynPregnancyInput;

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

        const pregnancy = await obgynPregnancyService.create(data);
        sendSuccess(res, pregnancy, 'OBGYN pregnancy created successfully', 201);
    } catch (error) {
        console.error('Create OBGYN pregnancy error:', error);
        sendError(res, 'Failed to create OBGYN pregnancy', 500);
    }
};

export const updateObgynPregnancy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateObgynPregnancyInput;

        const existing = await obgynPregnancyService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN pregnancy not found', 404);
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

        const pregnancy = await obgynPregnancyService.update(id, data);
        sendSuccess(res, pregnancy, 'OBGYN pregnancy updated successfully');
    } catch (error) {
        console.error('Update OBGYN pregnancy error:', error);
        sendError(res, 'Failed to update OBGYN pregnancy', 500);
    }
};

export const deleteObgynPregnancy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await obgynPregnancyService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN pregnancy not found', 404);
            return;
        }

        await obgynPregnancyService.delete(id);
        sendSuccess(res, null, 'OBGYN pregnancy deleted successfully');
    } catch (error) {
        console.error('Delete OBGYN pregnancy error:', error);
        sendError(res, 'Failed to delete OBGYN pregnancy', 500);
    }
};
