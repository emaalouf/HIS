import { Request, Response } from 'express';
import prisma from '../config/database';
import { pedsGrowthChartService } from '../services/pediatrics-growth-chart.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePedsGrowthChartInput, UpdatePedsGrowthChartInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPedsGrowthCharts = async (req: Request, res: Response): Promise<void> => {
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

        const { measurements, total } = await pedsGrowthChartService.list({
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

        sendPaginated(res, measurements, { page, limit, total });
    } catch (error) {
        console.error('Get pediatrics growth charts error:', error);
        sendError(res, 'Failed to fetch pediatrics growth charts', 500);
    }
};

export const getPedsGrowthChartById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const measurement = await pedsGrowthChartService.findById(id);

        if (!measurement) {
            sendError(res, 'Pediatrics growth chart not found', 404);
            return;
        }

        sendSuccess(res, measurement);
    } catch (error) {
        console.error('Get pediatrics growth chart error:', error);
        sendError(res, 'Failed to fetch pediatrics growth chart', 500);
    }
};

export const createPedsGrowthChart = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePedsGrowthChartInput;

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

        const measurement = await pedsGrowthChartService.create(data);
        sendSuccess(res, measurement, 'Pediatrics growth chart created successfully', 201);
    } catch (error) {
        console.error('Create pediatrics growth chart error:', error);
        sendError(res, 'Failed to create pediatrics growth chart', 500);
    }
};

export const updatePedsGrowthChart = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePedsGrowthChartInput;

        const existing = await pedsGrowthChartService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics growth chart not found', 404);
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

        const measurement = await pedsGrowthChartService.update(id, data);
        sendSuccess(res, measurement, 'Pediatrics growth chart updated successfully');
    } catch (error) {
        console.error('Update pediatrics growth chart error:', error);
        sendError(res, 'Failed to update pediatrics growth chart', 500);
    }
};

export const deletePedsGrowthChart = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pedsGrowthChartService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics growth chart not found', 404);
            return;
        }

        await pedsGrowthChartService.delete(id);
        sendSuccess(res, null, 'Pediatrics growth chart deleted successfully');
    } catch (error) {
        console.error('Delete pediatrics growth chart error:', error);
        sendError(res, 'Failed to delete pediatrics growth chart', 500);
    }
};
