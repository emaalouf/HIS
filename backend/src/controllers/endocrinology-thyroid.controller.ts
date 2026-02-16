import { Request, Response } from 'express';
import prisma from '../config/database';
import { endocrinologyThyroidService } from '../services/endocrinology-thyroid.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEndocrinologyThyroidInput, UpdateEndocrinologyThyroidInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getThyroidTests = async (req: Request, res: Response): Promise<void> => {
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

        const { tests, total } = await endocrinologyThyroidService.list({
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
        console.error('Get thyroid tests error:', error);
        sendError(res, 'Failed to fetch thyroid tests', 500);
    }
};

export const getThyroidTestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const test = await endocrinologyThyroidService.findById(id);

        if (!test) {
            sendError(res, 'Thyroid test not found', 404);
            return;
        }

        sendSuccess(res, test);
    } catch (error) {
        console.error('Get thyroid test error:', error);
        sendError(res, 'Failed to fetch thyroid test', 500);
    }
};

export const createThyroidTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateEndocrinologyThyroidInput;

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

        const test = await endocrinologyThyroidService.create(data);
        sendSuccess(res, test, 'Thyroid test created successfully', 201);
    } catch (error) {
        console.error('Create thyroid test error:', error);
        sendError(res, 'Failed to create thyroid test', 500);
    }
};

export const updateThyroidTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEndocrinologyThyroidInput;

        const existing = await endocrinologyThyroidService.findById(id);
        if (!existing) {
            sendError(res, 'Thyroid test not found', 404);
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

        const test = await endocrinologyThyroidService.update(id, data);
        sendSuccess(res, test, 'Thyroid test updated successfully');
    } catch (error) {
        console.error('Update thyroid test error:', error);
        sendError(res, 'Failed to update thyroid test', 500);
    }
};

export const deleteThyroidTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await endocrinologyThyroidService.findById(id);
        if (!existing) {
            sendError(res, 'Thyroid test not found', 404);
            return;
        }

        await endocrinologyThyroidService.delete(id);
        sendSuccess(res, null, 'Thyroid test deleted successfully');
    } catch (error) {
        console.error('Delete thyroid test error:', error);
        sendError(res, 'Failed to delete thyroid test', 500);
    }
};
