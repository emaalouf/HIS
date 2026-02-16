import { Request, Response } from 'express';
import { SpirometryQuality } from '@prisma/client';
import prisma from '../config/database';
import { pulmonologySpirometryService } from '../services/pulmonology-spirometry.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePulmonologySpirometryInput, UpdatePulmonologySpirometryInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getSpirometryTests = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { tests, total } = await pulmonologySpirometryService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, tests, { page, limit, total });
    } catch (error) {
        console.error('Get spirometry tests error:', error);
        sendError(res, 'Failed to fetch spirometry tests', 500);
    }
};

export const getSpirometryTestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const test = await pulmonologySpirometryService.findById(id);

        if (!test) {
            sendError(res, 'Spirometry test not found', 404);
            return;
        }

        sendSuccess(res, test);
    } catch (error) {
        console.error('Get spirometry test error:', error);
        sendError(res, 'Failed to fetch spirometry test', 500);
    }
};

export const createSpirometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePulmonologySpirometryInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            data.providerId ? prisma.user.findUnique({ where: { id: data.providerId } }) : Promise.resolve(null),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId && provider && (!providerRoles.includes(provider.role) || !provider.isActive)) {
            sendError(res, 'Provider must be an active clinician', 400);
            return;
        }

        const test = await pulmonologySpirometryService.create(data);
        sendSuccess(res, test, 'Spirometry test created successfully', 201);
    } catch (error) {
        console.error('Create spirometry test error:', error);
        sendError(res, 'Failed to create spirometry test', 500);
    }
};

export const updateSpirometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePulmonologySpirometryInput;

        const existing = await pulmonologySpirometryService.findById(id);
        if (!existing) {
            sendError(res, 'Spirometry test not found', 404);
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
            if (provider && (!providerRoles.includes(provider.role) || !provider.isActive)) {
                sendError(res, 'Provider must be an active clinician', 400);
                return;
            }
        }

        const test = await pulmonologySpirometryService.update(id, data);
        sendSuccess(res, test, 'Spirometry test updated successfully');
    } catch (error) {
        console.error('Update spirometry test error:', error);
        sendError(res, 'Failed to update spirometry test', 500);
    }
};

export const deleteSpirometryTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pulmonologySpirometryService.findById(id);
        if (!existing) {
            sendError(res, 'Spirometry test not found', 404);
            return;
        }

        await pulmonologySpirometryService.delete(id);
        sendSuccess(res, null, 'Spirometry test deleted successfully');
    } catch (error) {
        console.error('Delete spirometry test error:', error);
        sendError(res, 'Failed to delete spirometry test', 500);
    }
};
