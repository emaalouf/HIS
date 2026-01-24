import { Request, Response } from 'express';
import { NephrologyImagingModality, NephrologyTestStatus } from '@prisma/client';
import prisma from '../config/database';
import { nephrologyImagingService } from '../services/nephrology-imaging.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateNephrologyImagingInput, UpdateNephrologyImagingInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getNephrologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as NephrologyTestStatus | undefined;
        const modality = req.query.modality as NephrologyImagingModality | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const visitId = req.query.visitId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { studies, total } = await nephrologyImagingService.list({
            page,
            limit,
            search,
            status,
            modality,
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
        console.error('Get nephrology imaging error:', error);
        sendError(res, 'Failed to fetch nephrology imaging', 500);
    }
};

export const getNephrologyImagingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const study = await nephrologyImagingService.findById(id);

        if (!study) {
            sendError(res, 'Nephrology imaging not found', 404);
            return;
        }

        sendSuccess(res, study);
    } catch (error) {
        console.error('Get nephrology imaging error:', error);
        sendError(res, 'Failed to fetch nephrology imaging', 500);
    }
};

export const createNephrologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateNephrologyImagingInput;

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
            const visit = await prisma.nephrologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Nephrology visit not found', 404);
                return;
            }
        }

        const study = await nephrologyImagingService.create(data);
        sendSuccess(res, study, 'Nephrology imaging created successfully', 201);
    } catch (error) {
        console.error('Create nephrology imaging error:', error);
        sendError(res, 'Failed to create nephrology imaging', 500);
    }
};

export const updateNephrologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateNephrologyImagingInput;

        const existing = await nephrologyImagingService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology imaging not found', 404);
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
            const visit = await prisma.nephrologyVisit.findUnique({ where: { id: data.visitId } });
            if (!visit) {
                sendError(res, 'Nephrology visit not found', 404);
                return;
            }
        }

        const study = await nephrologyImagingService.update(id, data);
        sendSuccess(res, study, 'Nephrology imaging updated successfully');
    } catch (error) {
        console.error('Update nephrology imaging error:', error);
        sendError(res, 'Failed to update nephrology imaging', 500);
    }
};

export const deleteNephrologyImaging = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await nephrologyImagingService.findById(id);
        if (!existing) {
            sendError(res, 'Nephrology imaging not found', 404);
            return;
        }

        await nephrologyImagingService.delete(id);
        sendSuccess(res, null, 'Nephrology imaging deleted successfully');
    } catch (error) {
        console.error('Delete nephrology imaging error:', error);
        sendError(res, 'Failed to delete nephrology imaging', 500);
    }
};
