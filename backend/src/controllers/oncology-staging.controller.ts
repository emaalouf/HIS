import { Request, Response } from 'express';
import { CancerStage } from '@prisma/client';
import prisma from '../config/database';
import { oncologyStagingService } from '../services/oncology-staging.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOncologyStagingInput, UpdateOncologyStagingInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOncologyStagings = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const overallStage = req.query.overallStage as CancerStage | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { stagings, total } = await oncologyStagingService.list({
            page,
            limit,
            search,
            overallStage,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, stagings, { page, limit, total });
    } catch (error) {
        console.error('Get oncology stagings error:', error);
        sendError(res, 'Failed to fetch oncology stagings', 500);
    }
};

export const getOncologyStagingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const staging = await oncologyStagingService.findById(id);

        if (!staging) {
            sendError(res, 'Oncology staging not found', 404);
            return;
        }

        sendSuccess(res, staging);
    } catch (error) {
        console.error('Get oncology staging error:', error);
        sendError(res, 'Failed to fetch oncology staging', 500);
    }
};

export const createOncologyStaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOncologyStagingInput;

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

        const staging = await oncologyStagingService.create(data);
        sendSuccess(res, staging, 'Oncology staging created successfully', 201);
    } catch (error) {
        console.error('Create oncology staging error:', error);
        sendError(res, 'Failed to create oncology staging', 500);
    }
};

export const updateOncologyStaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOncologyStagingInput;

        const existing = await oncologyStagingService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology staging not found', 404);
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

        const staging = await oncologyStagingService.update(id, data);
        sendSuccess(res, staging, 'Oncology staging updated successfully');
    } catch (error) {
        console.error('Update oncology staging error:', error);
        sendError(res, 'Failed to update oncology staging', 500);
    }
};

export const deleteOncologyStaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await oncologyStagingService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology staging not found', 404);
            return;
        }

        await oncologyStagingService.delete(id);
        sendSuccess(res, null, 'Oncology staging deleted successfully');
    } catch (error) {
        console.error('Delete oncology staging error:', error);
        sendError(res, 'Failed to delete oncology staging', 500);
    }
};
