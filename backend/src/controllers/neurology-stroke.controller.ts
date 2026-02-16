import { Request, Response } from 'express';
import { StrokeType, StrokeSeverity } from '@prisma/client';
import prisma from '../config/database';
import { neurologyStrokeService } from '../services/neurology-stroke.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNeurologyStrokeInput, UpdateNeurologyStrokeInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNeurologyStrokes = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const strokeType = req.query.strokeType as StrokeType | undefined;
        const severity = req.query.severity as StrokeSeverity | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { strokes, total } = await neurologyStrokeService.list({
            page,
            limit,
            search,
            strokeType,
            severity,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, strokes, { page, limit, total });
    } catch (error) {
        console.error('Get neurology strokes error:', error);
        sendError(res, 'Failed to fetch neurology strokes', 500);
    }
};

export const getNeurologyStrokeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const stroke = await neurologyStrokeService.findById(id);

        if (!stroke) {
            sendError(res, 'Neurology stroke not found', 404);
            return;
        }

        sendSuccess(res, stroke);
    } catch (error) {
        console.error('Get neurology stroke error:', error);
        sendError(res, 'Failed to fetch neurology stroke', 500);
    }
};

export const createNeurologyStroke = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNeurologyStrokeInput;

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

        const stroke = await neurologyStrokeService.create(data);
        sendSuccess(res, stroke, 'Neurology stroke created successfully', 201);
    } catch (error) {
        console.error('Create neurology stroke error:', error);
        sendError(res, 'Failed to create neurology stroke', 500);
    }
};

export const updateNeurologyStroke = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNeurologyStrokeInput;

        const existing = await neurologyStrokeService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology stroke not found', 404);
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

        const stroke = await neurologyStrokeService.update(id, data);
        sendSuccess(res, stroke, 'Neurology stroke updated successfully');
    } catch (error) {
        console.error('Update neurology stroke error:', error);
        sendError(res, 'Failed to update neurology stroke', 500);
    }
};

export const deleteNeurologyStroke = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await neurologyStrokeService.findById(id);
        if (!existing) {
            sendError(res, 'Neurology stroke not found', 404);
            return;
        }

        await neurologyStrokeService.delete(id);
        sendSuccess(res, null, 'Neurology stroke deleted successfully');
    } catch (error) {
        console.error('Delete neurology stroke error:', error);
        sendError(res, 'Failed to delete neurology stroke', 500);
    }
};
