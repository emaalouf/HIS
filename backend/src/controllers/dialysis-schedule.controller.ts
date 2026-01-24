import { Request, Response } from 'express';
import { DialysisScheduleRecurrence } from '@prisma/client';
import prisma from '../config/database';
import { dialysisScheduleService } from '../services/dialysis-schedule.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDialysisScheduleInput, UpdateDialysisScheduleInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getDialysisSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const stationId = req.query.stationId as string | undefined;
        const recurrence = req.query.recurrence as DialysisScheduleRecurrence | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { schedules, total } = await dialysisScheduleService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            stationId,
            recurrence,
            isActive,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, schedules, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis schedules error:', error);
        sendError(res, 'Failed to fetch dialysis schedules', 500);
    }
};

export const getDialysisScheduleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const schedule = await dialysisScheduleService.findById(id);

        if (!schedule) {
            sendError(res, 'Dialysis schedule not found', 404);
            return;
        }

        sendSuccess(res, schedule);
    } catch (error) {
        console.error('Get dialysis schedule error:', error);
        sendError(res, 'Failed to fetch dialysis schedule', 500);
    }
};

export const createDialysisSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisScheduleInput;

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

        if (data.stationId) {
            const station = await prisma.dialysisStation.findUnique({ where: { id: data.stationId } });
            if (!station) {
                sendError(res, 'Dialysis station not found', 404);
                return;
            }
        }

        const schedule = await dialysisScheduleService.create(data);
        sendSuccess(res, schedule, 'Dialysis schedule created successfully', 201);
    } catch (error) {
        console.error('Create dialysis schedule error:', error);
        sendError(res, 'Failed to create dialysis schedule', 500);
    }
};

export const updateDialysisSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisScheduleInput;

        const existing = await dialysisScheduleService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis schedule not found', 404);
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

        if (data.stationId) {
            const station = await prisma.dialysisStation.findUnique({ where: { id: data.stationId } });
            if (!station) {
                sendError(res, 'Dialysis station not found', 404);
                return;
            }
        }

        const schedule = await dialysisScheduleService.update(id, data);
        sendSuccess(res, schedule, 'Dialysis schedule updated successfully');
    } catch (error) {
        console.error('Update dialysis schedule error:', error);
        sendError(res, 'Failed to update dialysis schedule', 500);
    }
};

export const deleteDialysisSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisScheduleService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis schedule not found', 404);
            return;
        }

        await dialysisScheduleService.delete(id);
        sendSuccess(res, null, 'Dialysis schedule deleted successfully');
    } catch (error) {
        console.error('Delete dialysis schedule error:', error);
        sendError(res, 'Failed to delete dialysis schedule', 500);
    }
};
