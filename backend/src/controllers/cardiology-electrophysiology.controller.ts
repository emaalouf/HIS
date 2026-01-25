import { Request, Response } from 'express';
import { CardiologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyElectrophysiologyService } from '../services/cardiology-electrophysiology.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyElectrophysiologyInput, UpdateCardiologyElectrophysiologyInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyElectrophysiologyStudies = async (req: Request, res: Response): Promise<void> => {
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

        const { studies, total } = await cardiologyElectrophysiologyService.list({
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

        sendPaginated(res, studies, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology electrophysiology studies error:', error);
        sendError(res, 'Failed to fetch cardiology electrophysiology studies', 500);
    }
};

export const getCardiologyElectrophysiologyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const study = await cardiologyElectrophysiologyService.findById(id);

        if (!study) {
            sendError(res, 'Cardiology electrophysiology study not found', 404);
            return;
        }

        sendSuccess(res, study);
    } catch (error) {
        console.error('Get cardiology electrophysiology study error:', error);
        sendError(res, 'Failed to fetch cardiology electrophysiology study', 500);
    }
};

export const createCardiologyElectrophysiology = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyElectrophysiologyInput;

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

        const study = await cardiologyElectrophysiologyService.create(data);
        sendSuccess(res, study, 'Cardiology electrophysiology study created successfully', 201);
    } catch (error) {
        console.error('Create cardiology electrophysiology study error:', error);
        sendError(res, 'Failed to create cardiology electrophysiology study', 500);
    }
};

export const updateCardiologyElectrophysiology = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyElectrophysiologyInput;

        const existing = await cardiologyElectrophysiologyService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology electrophysiology study not found', 404);
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

        const study = await cardiologyElectrophysiologyService.update(id, data);
        sendSuccess(res, study, 'Cardiology electrophysiology study updated successfully');
    } catch (error) {
        console.error('Update cardiology electrophysiology study error:', error);
        sendError(res, 'Failed to update cardiology electrophysiology study', 500);
    }
};

export const deleteCardiologyElectrophysiology = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyElectrophysiologyService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology electrophysiology study not found', 404);
            return;
        }

        await cardiologyElectrophysiologyService.delete(id);
        sendSuccess(res, null, 'Cardiology electrophysiology study deleted successfully');
    } catch (error) {
        console.error('Delete cardiology electrophysiology study error:', error);
        sendError(res, 'Failed to delete cardiology electrophysiology study', 500);
    }
};
