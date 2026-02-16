import { Request, Response } from 'express';
import prisma from '../config/database';
import { pulmonologyBronchoscopyService } from '../services/pulmonology-bronchoscopy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePulmonologyBronchoscopyInput, UpdatePulmonologyBronchoscopyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getBronchoscopies = async (req: Request, res: Response): Promise<void> => {
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

        const { procedures, total } = await pulmonologyBronchoscopyService.list({
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

        sendPaginated(res, procedures, { page, limit, total });
    } catch (error) {
        console.error('Get bronchoscopies error:', error);
        sendError(res, 'Failed to fetch bronchoscopies', 500);
    }
};

export const getBronchoscopyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const procedure = await pulmonologyBronchoscopyService.findById(id);

        if (!procedure) {
            sendError(res, 'Bronchoscopy not found', 404);
            return;
        }

        sendSuccess(res, procedure);
    } catch (error) {
        console.error('Get bronchoscopy error:', error);
        sendError(res, 'Failed to fetch bronchoscopy', 500);
    }
};

export const createBronchoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePulmonologyBronchoscopyInput;

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

        const procedure = await pulmonologyBronchoscopyService.create(data);
        sendSuccess(res, procedure, 'Bronchoscopy created successfully', 201);
    } catch (error) {
        console.error('Create bronchoscopy error:', error);
        sendError(res, 'Failed to create bronchoscopy', 500);
    }
};

export const updateBronchoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePulmonologyBronchoscopyInput;

        const existing = await pulmonologyBronchoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Bronchoscopy not found', 404);
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

        const procedure = await pulmonologyBronchoscopyService.update(id, data);
        sendSuccess(res, procedure, 'Bronchoscopy updated successfully');
    } catch (error) {
        console.error('Update bronchoscopy error:', error);
        sendError(res, 'Failed to update bronchoscopy', 500);
    }
};

export const deleteBronchoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pulmonologyBronchoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'Bronchoscopy not found', 404);
            return;
        }

        await pulmonologyBronchoscopyService.delete(id);
        sendSuccess(res, null, 'Bronchoscopy deleted successfully');
    } catch (error) {
        console.error('Delete bronchoscopy error:', error);
        sendError(res, 'Failed to delete bronchoscopy', 500);
    }
};
