import { Request, Response } from 'express';
import prisma from '../config/database';
import { entNasalEndoscopyService } from '../services/ent-nasal-endoscopy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEntNasalEndoscopyInput, UpdateEntNasalEndoscopyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getEntNasalEndoscopies = async (req: Request, res: Response): Promise<void> => {
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

        const { procedures, total } = await entNasalEndoscopyService.list({
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
        console.error('Get ENT nasal endoscopies error:', error);
        sendError(res, 'Failed to fetch ENT nasal endoscopies', 500);
    }
};

export const getEntNasalEndoscopyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const procedure = await entNasalEndoscopyService.findById(id);

        if (!procedure) {
            sendError(res, 'ENT nasal endoscopy not found', 404);
            return;
        }

        sendSuccess(res, procedure);
    } catch (error) {
        console.error('Get ENT nasal endoscopy error:', error);
        sendError(res, 'Failed to fetch ENT nasal endoscopy', 500);
    }
};

export const createEntNasalEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateEntNasalEndoscopyInput;

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

        const procedure = await entNasalEndoscopyService.create(data);
        sendSuccess(res, procedure, 'ENT nasal endoscopy created successfully', 201);
    } catch (error) {
        console.error('Create ENT nasal endoscopy error:', error);
        sendError(res, 'Failed to create ENT nasal endoscopy', 500);
    }
};

export const updateEntNasalEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEntNasalEndoscopyInput;

        const existing = await entNasalEndoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'ENT nasal endoscopy not found', 404);
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

        const procedure = await entNasalEndoscopyService.update(id, data);
        sendSuccess(res, procedure, 'ENT nasal endoscopy updated successfully');
    } catch (error) {
        console.error('Update ENT nasal endoscopy error:', error);
        sendError(res, 'Failed to update ENT nasal endoscopy', 500);
    }
};

export const deleteEntNasalEndoscopy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await entNasalEndoscopyService.findById(id);
        if (!existing) {
            sendError(res, 'ENT nasal endoscopy not found', 404);
            return;
        }

        await entNasalEndoscopyService.delete(id);
        sendSuccess(res, null, 'ENT nasal endoscopy deleted successfully');
    } catch (error) {
        console.error('Delete ENT nasal endoscopy error:', error);
        sendError(res, 'Failed to delete ENT nasal endoscopy', 500);
    }
};
