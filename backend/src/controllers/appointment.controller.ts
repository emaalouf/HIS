import { Request, Response } from 'express';
import { type AppointmentStatus } from '@prisma/client';
import prisma from '../config/database';
import { appointmentService } from '../services/appointment.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import {
    CreateAppointmentInput,
    UpdateAppointmentInput,
    UpdateAppointmentStatusInput,
} from '../utils/validators';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const providerId = req.query.providerId as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const status = (req.query.status as AppointmentStatus | undefined);
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const search = req.query.search as string | undefined;

        const { appointments, total } = await appointmentService.list({
            page,
            limit,
            providerId,
            patientId,
            status,
            startDate,
            endDate,
            search,
        });

        sendPaginated(res, appointments, { page, limit, total });
    } catch (error) {
        console.error('Get appointments error:', error);
        sendError(res, 'Failed to fetch appointments', 500);
    }
};

export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const appointment = await appointmentService.findById(id);

        if (!appointment) {
            sendError(res, 'Appointment not found', 404);
            return;
        }

        sendSuccess(res, appointment);
    } catch (error) {
        console.error('Get appointment error:', error);
        sendError(res, 'Failed to fetch appointment', 500);
    }
};

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const data = req.body as CreateAppointmentInput;

        const [patient, provider] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            prisma.user.findUnique({ where: { id: data.providerId } }),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (!provider || provider.role !== 'DOCTOR') {
            sendError(res, 'Provider must be an active doctor', 400);
            return;
        }

        const appointment = await appointmentService.create(data, req.user.userId);
        sendSuccess(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
        console.error('Create appointment error:', error);
        sendError(res, 'Failed to create appointment', 500);
    }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateAppointmentInput;

        const existing = await appointmentService.findById(id);
        if (!existing) {
            sendError(res, 'Appointment not found', 404);
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
            if (!provider || provider.role !== 'DOCTOR') {
                sendError(res, 'Provider must be an active doctor', 400);
                return;
            }
        }

        const appointment = await appointmentService.update(id, data);
        sendSuccess(res, appointment, 'Appointment updated successfully');
    } catch (error) {
        console.error('Update appointment error:', error);
        sendError(res, 'Failed to update appointment', 500);
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status, cancellationReason } = req.body as UpdateAppointmentStatusInput;

        const existing = await appointmentService.findById(id);
        if (!existing) {
            sendError(res, 'Appointment not found', 404);
            return;
        }

        const appointment = await appointmentService.updateStatus(id, status, cancellationReason);
        sendSuccess(res, appointment, 'Appointment status updated');
    } catch (error) {
        console.error('Update appointment status error:', error);
        sendError(res, 'Failed to update status', 500);
    }
};

export const getAppointmentMeta = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [visitTypes, locations, providers] = await Promise.all([
            appointmentService.getVisitTypes(),
            appointmentService.getLocations(),
            appointmentService.getProviders(),
        ]);

        sendSuccess(res, { visitTypes, locations, providers });
    } catch (error) {
        console.error('Get appointment meta error:', error);
        sendError(res, 'Failed to fetch appointment metadata', 500);
    }
};
