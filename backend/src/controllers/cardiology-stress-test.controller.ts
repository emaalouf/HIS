import { Request, Response } from 'express';
import { CardiologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyStressTestService } from '../services/cardiology-stress-test.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyStressTestInput, UpdateCardiologyStressTestInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyStressTests = async (req: Request, res: Response): Promise<void> => {
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
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { stressTests, total } = await cardiologyStressTestService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            visitId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, stressTests, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology stress tests error:', error);
        sendError(res, 'Failed to fetch cardiology stress tests', 500);
    }
};

export const getCardiologyStressTestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const stressTest = await cardiologyStressTestService.findById(id);

        if (!stressTest) {
            sendError(res, 'Cardiology stress test not found', 404);
            return;
        }

        sendSuccess(res, stressTest);
    } catch (error) {
        console.error('Get cardiology stress test error:', error);
        sendError(res, 'Failed to fetch cardiology stress test', 500);
    }
};

export const createCardiologyStressTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyStressTestInput;

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

        const stressTest = await cardiologyStressTestService.create(data);
        sendSuccess(res, stressTest, 'Cardiology stress test created successfully', 201);
    } catch (error) {
        console.error('Create cardiology stress test error:', error);
        sendError(res, 'Failed to create cardiology stress test', 500);
    }
};

export const updateCardiologyStressTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyStressTestInput;

        const existing = await cardiologyStressTestService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology stress test not found', 404);
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

        const stressTest = await cardiologyStressTestService.update(id, data);
        sendSuccess(res, stressTest, 'Cardiology stress test updated successfully');
    } catch (error) {
        console.error('Update cardiology stress test error:', error);
        sendError(res, 'Failed to update cardiology stress test', 500);
    }
};

export const deleteCardiologyStressTest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyStressTestService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology stress test not found', 404);
            return;
        }

        await cardiologyStressTestService.delete(id);
        sendSuccess(res, null, 'Cardiology stress test deleted successfully');
    } catch (error) {
        console.error('Delete cardiology stress test error:', error);
        sendError(res, 'Failed to delete cardiology stress test', 500);
    }
};
