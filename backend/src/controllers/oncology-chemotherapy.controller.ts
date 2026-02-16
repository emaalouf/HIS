import { Request, Response } from 'express';
import { ChemotherapyStatus } from '@prisma/client';
import prisma from '../config/database';
import { oncologyChemotherapyService } from '../services/oncology-chemotherapy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOncologyChemotherapyInput, UpdateOncologyChemotherapyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOncologyChemotherapies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as ChemotherapyStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { chemotherapies, total } = await oncologyChemotherapyService.list({
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

        sendPaginated(res, chemotherapies, { page, limit, total });
    } catch (error) {
        console.error('Get oncology chemotherapies error:', error);
        sendError(res, 'Failed to fetch oncology chemotherapies', 500);
    }
};

export const getOncologyChemotherapyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const chemotherapy = await oncologyChemotherapyService.findById(id);

        if (!chemotherapy) {
            sendError(res, 'Oncology chemotherapy not found', 404);
            return;
        }

        sendSuccess(res, chemotherapy);
    } catch (error) {
        console.error('Get oncology chemotherapy error:', error);
        sendError(res, 'Failed to fetch oncology chemotherapy', 500);
    }
};

export const createOncologyChemotherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOncologyChemotherapyInput;

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

        const chemotherapy = await oncologyChemotherapyService.create(data);
        sendSuccess(res, chemotherapy, 'Oncology chemotherapy created successfully', 201);
    } catch (error) {
        console.error('Create oncology chemotherapy error:', error);
        sendError(res, 'Failed to create oncology chemotherapy', 500);
    }
};

export const updateOncologyChemotherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOncologyChemotherapyInput;

        const existing = await oncologyChemotherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology chemotherapy not found', 404);
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

        const chemotherapy = await oncologyChemotherapyService.update(id, data);
        sendSuccess(res, chemotherapy, 'Oncology chemotherapy updated successfully');
    } catch (error) {
        console.error('Update oncology chemotherapy error:', error);
        sendError(res, 'Failed to update oncology chemotherapy', 500);
    }
};

export const deleteOncologyChemotherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await oncologyChemotherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology chemotherapy not found', 404);
            return;
        }

        await oncologyChemotherapyService.delete(id);
        sendSuccess(res, null, 'Oncology chemotherapy deleted successfully');
    } catch (error) {
        console.error('Delete oncology chemotherapy error:', error);
        sendError(res, 'Failed to delete oncology chemotherapy', 500);
    }
};
