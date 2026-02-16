import { Request, Response } from 'express';
import prisma from '../config/database';
import { pedsDevelopmentalService } from '../services/pediatrics-developmental.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePedsDevelopmentalInput, UpdatePedsDevelopmentalInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPedsDevelopmentalAssessments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const concernsIdentified = req.query.concernsIdentified === 'true' ? true : 
                                   req.query.concernsIdentified === 'false' ? false : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { assessments, total } = await pedsDevelopmentalService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            concernsIdentified,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, assessments, { page, limit, total });
    } catch (error) {
        console.error('Get pediatrics developmental assessments error:', error);
        sendError(res, 'Failed to fetch pediatrics developmental assessments', 500);
    }
};

export const getPedsDevelopmentalAssessmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const assessment = await pedsDevelopmentalService.findById(id);

        if (!assessment) {
            sendError(res, 'Pediatrics developmental assessment not found', 404);
            return;
        }

        sendSuccess(res, assessment);
    } catch (error) {
        console.error('Get pediatrics developmental assessment error:', error);
        sendError(res, 'Failed to fetch pediatrics developmental assessment', 500);
    }
};

export const createPedsDevelopmentalAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePedsDevelopmentalInput;

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

        const assessment = await pedsDevelopmentalService.create(data);
        sendSuccess(res, assessment, 'Pediatrics developmental assessment created successfully', 201);
    } catch (error) {
        console.error('Create pediatrics developmental assessment error:', error);
        sendError(res, 'Failed to create pediatrics developmental assessment', 500);
    }
};

export const updatePedsDevelopmentalAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePedsDevelopmentalInput;

        const existing = await pedsDevelopmentalService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics developmental assessment not found', 404);
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

        const assessment = await pedsDevelopmentalService.update(id, data);
        sendSuccess(res, assessment, 'Pediatrics developmental assessment updated successfully');
    } catch (error) {
        console.error('Update pediatrics developmental assessment error:', error);
        sendError(res, 'Failed to update pediatrics developmental assessment', 500);
    }
};

export const deletePedsDevelopmentalAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await pedsDevelopmentalService.findById(id);
        if (!existing) {
            sendError(res, 'Pediatrics developmental assessment not found', 404);
            return;
        }

        await pedsDevelopmentalService.delete(id);
        sendSuccess(res, null, 'Pediatrics developmental assessment deleted successfully');
    } catch (error) {
        console.error('Delete pediatrics developmental assessment error:', error);
        sendError(res, 'Failed to delete pediatrics developmental assessment', 500);
    }
};
