import { Request, Response } from 'express';
import { RadiationStatus } from '@prisma/client';
import prisma from '../config/database';
import { oncologyRadiationService } from '../services/oncology-radiation.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOncologyRadiationInput, UpdateOncologyRadiationInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOncologyRadiations = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as RadiationStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { radiations, total } = await oncologyRadiationService.list({
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

        sendPaginated(res, radiations, { page, limit, total });
    } catch (error) {
        console.error('Get oncology radiations error:', error);
        sendError(res, 'Failed to fetch oncology radiations', 500);
    }
};

export const getOncologyRadiationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const radiation = await oncologyRadiationService.findById(id);

        if (!radiation) {
            sendError(res, 'Oncology radiation not found', 404);
            return;
        }

        sendSuccess(res, radiation);
    } catch (error) {
        console.error('Get oncology radiation error:', error);
        sendError(res, 'Failed to fetch oncology radiation', 500);
    }
};

export const createOncologyRadiation = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOncologyRadiationInput;

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

        const radiation = await oncologyRadiationService.create(data);
        sendSuccess(res, radiation, 'Oncology radiation created successfully', 201);
    } catch (error) {
        console.error('Create oncology radiation error:', error);
        sendError(res, 'Failed to create oncology radiation', 500);
    }
};

export const updateOncologyRadiation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOncologyRadiationInput;

        const existing = await oncologyRadiationService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology radiation not found', 404);
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

        const radiation = await oncologyRadiationService.update(id, data);
        sendSuccess(res, radiation, 'Oncology radiation updated successfully');
    } catch (error) {
        console.error('Update oncology radiation error:', error);
        sendError(res, 'Failed to update oncology radiation', 500);
    }
};

export const deleteOncologyRadiation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await oncologyRadiationService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology radiation not found', 404);
            return;
        }

        await oncologyRadiationService.delete(id);
        sendSuccess(res, null, 'Oncology radiation deleted successfully');
    } catch (error) {
        console.error('Delete oncology radiation error:', error);
        sendError(res, 'Failed to delete oncology radiation', 500);
    }
};
