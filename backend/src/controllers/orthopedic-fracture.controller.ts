import { Request, Response } from 'express';
import { FractureStatus, FractureType } from '@prisma/client';
import prisma from '../config/database';
import { orthopedicFractureService } from '../services/orthopedic-fracture.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOrthopedicFractureInput, UpdateOrthopedicFractureInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOrthopedicFractures = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as FractureStatus | undefined;
        const fractureType = req.query.fractureType as FractureType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { fractures, total } = await orthopedicFractureService.list({
            page,
            limit,
            search,
            status,
            fractureType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, fractures, { page, limit, total });
    } catch (error) {
        console.error('Get orthopedic fractures error:', error);
        sendError(res, 'Failed to fetch orthopedic fractures', 500);
    }
};

export const getOrthopedicFractureById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const fracture = await orthopedicFractureService.findById(id);

        if (!fracture) {
            sendError(res, 'Orthopedic fracture not found', 404);
            return;
        }

        sendSuccess(res, fracture);
    } catch (error) {
        console.error('Get orthopedic fracture error:', error);
        sendError(res, 'Failed to fetch orthopedic fracture', 500);
    }
};

export const createOrthopedicFracture = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOrthopedicFractureInput;

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

        const fracture = await orthopedicFractureService.create(data);
        sendSuccess(res, fracture, 'Orthopedic fracture created successfully', 201);
    } catch (error) {
        console.error('Create orthopedic fracture error:', error);
        sendError(res, 'Failed to create orthopedic fracture', 500);
    }
};

export const updateOrthopedicFracture = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOrthopedicFractureInput;

        const existing = await orthopedicFractureService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic fracture not found', 404);
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

        const fracture = await orthopedicFractureService.update(id, data);
        sendSuccess(res, fracture, 'Orthopedic fracture updated successfully');
    } catch (error) {
        console.error('Update orthopedic fracture error:', error);
        sendError(res, 'Failed to update orthopedic fracture', 500);
    }
};

export const deleteOrthopedicFracture = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await orthopedicFractureService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic fracture not found', 404);
            return;
        }

        await orthopedicFractureService.delete(id);
        sendSuccess(res, null, 'Orthopedic fracture deleted successfully');
    } catch (error) {
        console.error('Delete orthopedic fracture error:', error);
        sendError(res, 'Failed to delete orthopedic fracture', 500);
    }
};
