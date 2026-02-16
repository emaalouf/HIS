import { Request, Response } from 'express';
import prisma from '../config/database';
import { orthopedicPhysicalTherapyService } from '../services/orthopedic-physical-therapy.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOrthopedicPhysicalTherapyInput, UpdateOrthopedicPhysicalTherapyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOrthopedicPhysicalTherapies = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const currentStatus = req.query.currentStatus as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { therapies, total } = await orthopedicPhysicalTherapyService.list({
            page,
            limit,
            search,
            currentStatus,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, therapies, { page, limit, total });
    } catch (error) {
        console.error('Get orthopedic physical therapies error:', error);
        sendError(res, 'Failed to fetch orthopedic physical therapies', 500);
    }
};

export const getOrthopedicPhysicalTherapyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const therapy = await orthopedicPhysicalTherapyService.findById(id);

        if (!therapy) {
            sendError(res, 'Orthopedic physical therapy not found', 404);
            return;
        }

        sendSuccess(res, therapy);
    } catch (error) {
        console.error('Get orthopedic physical therapy error:', error);
        sendError(res, 'Failed to fetch orthopedic physical therapy', 500);
    }
};

export const createOrthopedicPhysicalTherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOrthopedicPhysicalTherapyInput;

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

        const therapy = await orthopedicPhysicalTherapyService.create(data);
        sendSuccess(res, therapy, 'Orthopedic physical therapy created successfully', 201);
    } catch (error) {
        console.error('Create orthopedic physical therapy error:', error);
        sendError(res, 'Failed to create orthopedic physical therapy', 500);
    }
};

export const updateOrthopedicPhysicalTherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOrthopedicPhysicalTherapyInput;

        const existing = await orthopedicPhysicalTherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic physical therapy not found', 404);
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

        const therapy = await orthopedicPhysicalTherapyService.update(id, data);
        sendSuccess(res, therapy, 'Orthopedic physical therapy updated successfully');
    } catch (error) {
        console.error('Update orthopedic physical therapy error:', error);
        sendError(res, 'Failed to update orthopedic physical therapy', 500);
    }
};

export const deleteOrthopedicPhysicalTherapy = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await orthopedicPhysicalTherapyService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic physical therapy not found', 404);
            return;
        }

        await orthopedicPhysicalTherapyService.delete(id);
        sendSuccess(res, null, 'Orthopedic physical therapy deleted successfully');
    } catch (error) {
        console.error('Delete orthopedic physical therapy error:', error);
        sendError(res, 'Failed to delete orthopedic physical therapy', 500);
    }
};
