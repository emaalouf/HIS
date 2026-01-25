import { Request, Response } from 'express';
import { CardiologyTestStatus, HeartFailureStage, NYHAClass } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyHeartFailureService } from '../services/cardiology-heart-failure.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyHeartFailureInput, UpdateCardiologyHeartFailureInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyHeartFailureAssessments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as CardiologyTestStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const visitId = req.query.visitId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const nyhaClassParam = req.query.nyhaClass as string | undefined;
        const nyhaClass = nyhaClassParam && Object.values(NYHAClass).includes(nyhaClassParam as NYHAClass)
            ? (nyhaClassParam as NYHAClass)
            : undefined;
        const heartFailureStageParam = req.query.heartFailureStage as string | undefined;
        const heartFailureStage = heartFailureStageParam
            && Object.values(HeartFailureStage).includes(heartFailureStageParam as HeartFailureStage)
            ? (heartFailureStageParam as HeartFailureStage)
            : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { assessments, total } = await cardiologyHeartFailureService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            visitId,
            startDate,
            endDate,
            nyhaClass,
            heartFailureStage,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, assessments, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology heart failure assessments error:', error);
        sendError(res, 'Failed to fetch cardiology heart failure assessments', 500);
    }
};

export const getCardiologyHeartFailureById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const assessment = await cardiologyHeartFailureService.findById(id);

        if (!assessment) {
            sendError(res, 'Cardiology heart failure assessment not found', 404);
            return;
        }

        sendSuccess(res, assessment);
    } catch (error) {
        console.error('Get cardiology heart failure assessment error:', error);
        sendError(res, 'Failed to fetch cardiology heart failure assessment', 500);
    }
};

export const createCardiologyHeartFailure = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyHeartFailureInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId) {
            const provider = await prisma.user.findUnique({ where: { id: data.providerId } });
            if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
                sendError(res, 'Provider must be an active clinician', 400);
                return;
            }
        }

        if (data.visitId) {
            const visit = await prisma.cardiologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Cardiology visit not found', 404);
                return;
            }
        }

        const assessment = await cardiologyHeartFailureService.create(data);
        sendSuccess(res, assessment, 'Cardiology heart failure assessment created successfully', 201);
    } catch (error) {
        console.error('Create cardiology heart failure assessment error:', error);
        sendError(res, 'Failed to create cardiology heart failure assessment', 500);
    }
};

export const updateCardiologyHeartFailure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyHeartFailureInput;

        const existing = await cardiologyHeartFailureService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology heart failure assessment not found', 404);
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

        if (data.visitId) {
            const visit = await prisma.cardiologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Cardiology visit not found', 404);
                return;
            }
        }

        const assessment = await cardiologyHeartFailureService.update(id, data);
        sendSuccess(res, assessment, 'Cardiology heart failure assessment updated successfully');
    } catch (error) {
        console.error('Update cardiology heart failure assessment error:', error);
        sendError(res, 'Failed to update cardiology heart failure assessment', 500);
    }
};

export const deleteCardiologyHeartFailure = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyHeartFailureService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology heart failure assessment not found', 404);
            return;
        }

        await cardiologyHeartFailureService.delete(id);
        sendSuccess(res, null, 'Cardiology heart failure assessment deleted successfully');
    } catch (error) {
        console.error('Delete cardiology heart failure assessment error:', error);
        sendError(res, 'Failed to delete cardiology heart failure assessment', 500);
    }
};
