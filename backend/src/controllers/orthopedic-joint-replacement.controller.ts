import { Request, Response } from 'express';
import { JointType } from '@prisma/client';
import prisma from '../config/database';
import { orthopedicJointReplacementService } from '../services/orthopedic-joint-replacement.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOrthopedicJointReplacementInput, UpdateOrthopedicJointReplacementInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOrthopedicJointReplacements = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const jointType = req.query.jointType as JointType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { replacements, total } = await orthopedicJointReplacementService.list({
            page,
            limit,
            search,
            jointType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, replacements, { page, limit, total });
    } catch (error) {
        console.error('Get orthopedic joint replacements error:', error);
        sendError(res, 'Failed to fetch orthopedic joint replacements', 500);
    }
};

export const getOrthopedicJointReplacementById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const replacement = await orthopedicJointReplacementService.findById(id);

        if (!replacement) {
            sendError(res, 'Orthopedic joint replacement not found', 404);
            return;
        }

        sendSuccess(res, replacement);
    } catch (error) {
        console.error('Get orthopedic joint replacement error:', error);
        sendError(res, 'Failed to fetch orthopedic joint replacement', 500);
    }
};

export const createOrthopedicJointReplacement = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOrthopedicJointReplacementInput;

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

        const replacement = await orthopedicJointReplacementService.create(data);
        sendSuccess(res, replacement, 'Orthopedic joint replacement created successfully', 201);
    } catch (error) {
        console.error('Create orthopedic joint replacement error:', error);
        sendError(res, 'Failed to create orthopedic joint replacement', 500);
    }
};

export const updateOrthopedicJointReplacement = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOrthopedicJointReplacementInput;

        const existing = await orthopedicJointReplacementService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic joint replacement not found', 404);
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

        const replacement = await orthopedicJointReplacementService.update(id, data);
        sendSuccess(res, replacement, 'Orthopedic joint replacement updated successfully');
    } catch (error) {
        console.error('Update orthopedic joint replacement error:', error);
        sendError(res, 'Failed to update orthopedic joint replacement', 500);
    }
};

export const deleteOrthopedicJointReplacement = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await orthopedicJointReplacementService.findById(id);
        if (!existing) {
            sendError(res, 'Orthopedic joint replacement not found', 404);
            return;
        }

        await orthopedicJointReplacementService.delete(id);
        sendSuccess(res, null, 'Orthopedic joint replacement deleted successfully');
    } catch (error) {
        console.error('Delete orthopedic joint replacement error:', error);
        sendError(res, 'Failed to delete orthopedic joint replacement', 500);
    }
};
