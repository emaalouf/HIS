import { Request, Response } from 'express';
import { DiabetesType } from '@prisma/client';
import prisma from '../config/database';
import { endocrinologyDiabetesService } from '../services/endocrinology-diabetes.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEndocrinologyDiabetesInput, UpdateEndocrinologyDiabetesInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDiabetesRecords = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const diabetesType = req.query.diabetesType as DiabetesType | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { records, total } = await endocrinologyDiabetesService.list({
            page,
            limit,
            search,
            diabetesType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, records, { page, limit, total });
    } catch (error) {
        console.error('Get diabetes records error:', error);
        sendError(res, 'Failed to fetch diabetes records', 500);
    }
};

export const getDiabetesRecordById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const record = await endocrinologyDiabetesService.findById(id);

        if (!record) {
            sendError(res, 'Diabetes record not found', 404);
            return;
        }

        sendSuccess(res, record);
    } catch (error) {
        console.error('Get diabetes record error:', error);
        sendError(res, 'Failed to fetch diabetes record', 500);
    }
};

export const createDiabetesRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateEndocrinologyDiabetesInput;

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

        const record = await endocrinologyDiabetesService.create(data);
        sendSuccess(res, record, 'Diabetes record created successfully', 201);
    } catch (error) {
        console.error('Create diabetes record error:', error);
        sendError(res, 'Failed to create diabetes record', 500);
    }
};

export const updateDiabetesRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEndocrinologyDiabetesInput;

        const existing = await endocrinologyDiabetesService.findById(id);
        if (!existing) {
            sendError(res, 'Diabetes record not found', 404);
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

        const record = await endocrinologyDiabetesService.update(id, data);
        sendSuccess(res, record, 'Diabetes record updated successfully');
    } catch (error) {
        console.error('Update diabetes record error:', error);
        sendError(res, 'Failed to update diabetes record', 500);
    }
};

export const deleteDiabetesRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await endocrinologyDiabetesService.findById(id);
        if (!existing) {
            sendError(res, 'Diabetes record not found', 404);
            return;
        }

        await endocrinologyDiabetesService.delete(id);
        sendSuccess(res, null, 'Diabetes record deleted successfully');
    } catch (error) {
        console.error('Delete diabetes record error:', error);
        sendError(res, 'Failed to delete diabetes record', 500);
    }
};
