import { Request, Response } from 'express';
import prisma from '../config/database';
import { ophthalmologyExamService } from '../services/ophthalmology-exam.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOphthExamInput, UpdateOphthExamInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOphthExams = async (req: Request, res: Response): Promise<void> => {
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

        const { exams, total } = await ophthalmologyExamService.list({
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

        sendPaginated(res, exams, { page, limit, total });
    } catch (error) {
        console.error('Get ophthalmology exams error:', error);
        sendError(res, 'Failed to fetch ophthalmology exams', 500);
    }
};

export const getOphthExamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const exam = await ophthalmologyExamService.findById(id);

        if (!exam) {
            sendError(res, 'Ophthalmology exam not found', 404);
            return;
        }

        sendSuccess(res, exam);
    } catch (error) {
        console.error('Get ophthalmology exam error:', error);
        sendError(res, 'Failed to fetch ophthalmology exam', 500);
    }
};

export const createOphthExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOphthExamInput;

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

        const exam = await ophthalmologyExamService.create(data);
        sendSuccess(res, exam, 'Ophthalmology exam created successfully', 201);
    } catch (error) {
        console.error('Create ophthalmology exam error:', error);
        sendError(res, 'Failed to create ophthalmology exam', 500);
    }
};

export const updateOphthExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOphthExamInput;

        const existing = await ophthalmologyExamService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology exam not found', 404);
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

        const exam = await ophthalmologyExamService.update(id, data);
        sendSuccess(res, exam, 'Ophthalmology exam updated successfully');
    } catch (error) {
        console.error('Update ophthalmology exam error:', error);
        sendError(res, 'Failed to update ophthalmology exam', 500);
    }
};

export const deleteOphthExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await ophthalmologyExamService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology exam not found', 404);
            return;
        }

        await ophthalmologyExamService.delete(id);
        sendSuccess(res, null, 'Ophthalmology exam deleted successfully');
    } catch (error) {
        console.error('Delete ophthalmology exam error:', error);
        sendError(res, 'Failed to delete ophthalmology exam', 500);
    }
};
