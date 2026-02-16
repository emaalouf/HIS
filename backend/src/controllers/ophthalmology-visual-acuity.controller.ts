import { Request, Response } from 'express';
import prisma from '../config/database';
import { ophthalmologyVisualAcuityService } from '../services/ophthalmology-visual-acuity.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOphthVisualAcuityInput, UpdateOphthVisualAcuityInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOphthVisualAcuityTests = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const eyeSide = req.query.eyeSide as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { tests, total } = await ophthalmologyVisualAcuityService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            eyeSide,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, tests, { page, limit, total });
    } catch (error) {
        console.error('Get ophthalmology visual acuity tests error:', error);
        sendError(res, 'Failed to fetch ophthalmology visual acuity tests', 500);
    }
};

export const getOphthVisualAcuityTestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const test = await ophthalmologyVisualAcuityService.findById(id);

        if (!test) {
            sendError(res, 'Ophthalmology visual acuity test not found', 404);
            return;
        }

        sendSuccess(res, test);
    } catch (error) {
        console.error('Get ophthalmology visual acuity test error:', error);
        sendError(res, 'Failed to fetch ophthalmology visual acuity test', 500);
    }
};

export const createOphthVisualAcuityTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOphthVisualAcuityInput;

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

        const test = await ophthalmologyVisualAcuityService.create(data);
        sendSuccess(res, test, 'Ophthalmology visual acuity test created successfully', 201);
    } catch (error) {
        console.error('Create ophthalmology visual acuity test error:', error);
        sendError(res, 'Failed to create ophthalmology visual acuity test', 500);
    }
};

export const updateOphthVisualAcuityTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOphthVisualAcuityInput;

        const existing = await ophthalmologyVisualAcuityService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology visual acuity test not found', 404);
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

        const test = await ophthalmologyVisualAcuityService.update(id, data);
        sendSuccess(res, test, 'Ophthalmology visual acuity test updated successfully');
    } catch (error) {
        console.error('Update ophthalmology visual acuity test error:', error);
        sendError(res, 'Failed to update ophthalmology visual acuity test', 500);
    }
};

export const deleteOphthVisualAcuityTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await ophthalmologyVisualAcuityService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology visual acuity test not found', 404);
            return;
        }

        await ophthalmologyVisualAcuityService.delete(id);
        sendSuccess(res, null, 'Ophthalmology visual acuity test deleted successfully');
    } catch (error) {
        console.error('Delete ophthalmology visual acuity test error:', error);
        sendError(res, 'Failed to delete ophthalmology visual acuity test', 500);
    }
};
