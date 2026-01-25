import { Request, Response } from 'express';
import { SurgeryStatus, SurgeryPriority } from '@prisma/client';
import prisma from '../config/database';
import { surgeryService } from '../services/surgery.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateSurgeryInput, UpdateSurgeryInput } from '../utils/validators';

export const getSurgeries = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as SurgeryStatus | undefined;
        const priority = req.query.priority as SurgeryPriority | undefined;
        const patientId = req.query.patientId as string | undefined;
        const theaterId = req.query.theaterId as string | undefined;
        const admissionId = req.query.admissionId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { surgeries, total } = await surgeryService.list({
            page,
            limit,
            search,
            status,
            priority,
            patientId,
            theaterId,
            admissionId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, surgeries, { page, limit, total });
    } catch (error) {
        console.error('Get surgeries error:', error);
        sendError(res, 'Failed to fetch surgeries', 500);
    }
};

export const getSurgeryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const surgery = await surgeryService.findById(id);

        if (!surgery) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        sendSuccess(res, surgery);
    } catch (error) {
        console.error('Get surgery error:', error);
        sendError(res, 'Failed to fetch surgery', 500);
    }
};

export const createSurgery = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateSurgeryInput;

        const patient = await prisma.patient.findUnique({
            where: { id: data.patientId },
        });

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.admissionId) {
            const admission = await prisma.admission.findUnique({
                where: { id: data.admissionId },
            });
            if (!admission) {
                sendError(res, 'Admission not found', 404);
                return;
            }
        }

        if (data.theaterId) {
            const theater = await prisma.operatingTheater.findUnique({
                where: { id: data.theaterId },
            });
            if (!theater) {
                sendError(res, 'Operating theater not found', 404);
                return;
            }
        }

        const surgery = await surgeryService.create(data);
        sendSuccess(res, surgery, 'Surgery created successfully', 201);
    } catch (error) {
        console.error('Create surgery error:', error);
        sendError(res, 'Failed to create surgery', 500);
    }
};

export const updateSurgery = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateSurgeryInput;

        const existing = await surgeryService.findById(id);
        if (!existing) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({
                where: { id: data.patientId },
            });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.admissionId) {
            const admission = await prisma.admission.findUnique({
                where: { id: data.admissionId },
            });
            if (!admission) {
                sendError(res, 'Admission not found', 404);
                return;
            }
        }

        if (data.theaterId) {
            const theater = await prisma.operatingTheater.findUnique({
                where: { id: data.theaterId },
            });
            if (!theater) {
                sendError(res, 'Operating theater not found', 404);
                return;
            }
        }

        const surgery = await surgeryService.update(id, data);
        sendSuccess(res, surgery, 'Surgery updated successfully');
    } catch (error) {
        console.error('Update surgery error:', error);
        sendError(res, 'Failed to update surgery', 500);
    }
};

export const updateSurgeryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status, actualStart, actualEnd } = req.body;

        const existing = await surgeryService.findById(id);
        if (!existing) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        const surgery = await surgeryService.updateStatus(id, status, actualStart, actualEnd);
        sendSuccess(res, surgery, 'Surgery status updated successfully');
    } catch (error) {
        console.error('Update surgery status error:', error);
        sendError(res, 'Failed to update surgery status', 500);
    }
};

export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { userId, role, notes } = req.body;

        const surgery = await surgeryService.findById(id);
        if (!surgery) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        const teamMember = await surgeryService.addTeamMember({
            surgeryId: id,
            userId,
            role,
            notes,
        });
        sendSuccess(res, teamMember, 'Team member added successfully', 201);
    } catch (error) {
        console.error('Add team member error:', error);
        sendError(res, 'Failed to add team member', 500);
    }
};

export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { userId, role } = req.body;

        const surgery = await surgeryService.findById(id);
        if (!surgery) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        await surgeryService.removeTeamMember(id, userId, role);
        sendSuccess(res, null, 'Team member removed successfully');
    } catch (error) {
        console.error('Remove team member error:', error);
        sendError(res, 'Failed to remove team member', 500);
    }
};

export const deleteSurgery = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await surgeryService.findById(id);
        if (!existing) {
            sendError(res, 'Surgery not found', 404);
            return;
        }

        await surgeryService.delete(id);
        sendSuccess(res, null, 'Surgery deleted successfully');
    } catch (error) {
        console.error('Delete surgery error:', error);
        sendError(res, 'Failed to delete surgery', 500);
    }
};