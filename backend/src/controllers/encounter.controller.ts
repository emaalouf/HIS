import { Request, Response } from 'express';
import { EncounterStatus } from '@prisma/client';
import prisma from '../config/database';
import { encounterService } from '../services/encounter.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateEncounterInput, UpdateEncounterInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getEncounters = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as EncounterStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { encounters, total } = await encounterService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, encounters, { page, limit, total });
    } catch (error) {
        console.error('Get encounters error:', error);
        sendError(res, 'Failed to fetch encounters', 500);
    }
};

export const getEncounterById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const encounter = await encounterService.findById(id);

        if (!encounter) {
            sendError(res, 'Encounter not found', 404);
            return;
        }

        sendSuccess(res, encounter);
    } catch (error) {
        console.error('Get encounter error:', error);
        sendError(res, 'Failed to fetch encounter', 500);
    }
};

export const createEncounter = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        const data = req.body as CreateEncounterInput;

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

        if (data.appointmentId) {
            const appointment = await prisma.appointment.findUnique({ where: { id: data.appointmentId } });
            if (!appointment) {
                sendError(res, 'Appointment not found', 404);
                return;
            }
            const existingEncounter = await prisma.encounter.findUnique({
                where: { appointmentId: data.appointmentId },
            });
            if (existingEncounter) {
                sendError(res, 'Appointment already has an encounter', 400);
                return;
            }
        }

        if (data.admissionId) {
            const admission = await prisma.admission.findUnique({ where: { id: data.admissionId } });
            if (!admission) {
                sendError(res, 'Admission not found', 404);
                return;
            }
        }

        const encounter = await encounterService.create(data, req.user.userId);
        sendSuccess(res, encounter, 'Encounter created successfully', 201);
    } catch (error) {
        console.error('Create encounter error:', error);
        sendError(res, 'Failed to create encounter', 500);
    }
};

export const updateEncounter = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateEncounterInput;

        const existing = await encounterService.findById(id);
        if (!existing) {
            sendError(res, 'Encounter not found', 404);
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

        if (data.appointmentId) {
            const appointment = await prisma.appointment.findUnique({ where: { id: data.appointmentId } });
            if (!appointment) {
                sendError(res, 'Appointment not found', 404);
                return;
            }
            const existingEncounter = await prisma.encounter.findUnique({
                where: { appointmentId: data.appointmentId },
            });
            if (existingEncounter && existingEncounter.id !== id) {
                sendError(res, 'Appointment already has an encounter', 400);
                return;
            }
        }

        if (data.admissionId) {
            const admission = await prisma.admission.findUnique({ where: { id: data.admissionId } });
            if (!admission) {
                sendError(res, 'Admission not found', 404);
                return;
            }
        }

        const encounter = await encounterService.update(id, data);
        sendSuccess(res, encounter, 'Encounter updated successfully');
    } catch (error) {
        console.error('Update encounter error:', error);
        sendError(res, 'Failed to update encounter', 500);
    }
};

export const deleteEncounter = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await encounterService.findById(id);
        if (!existing) {
            sendError(res, 'Encounter not found', 404);
            return;
        }

        await encounterService.delete(id);
        sendSuccess(res, null, 'Encounter deleted successfully');
    } catch (error) {
        console.error('Delete encounter error:', error);
        sendError(res, 'Failed to delete encounter', 500);
    }
};
