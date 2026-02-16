import { Request, Response } from 'express';
import prisma from '../config/database';
import { ophthalmologyFundusService } from '../services/ophthalmology-fundus.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOphthFundusInput, UpdateOphthFundusInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOphthFundusExams = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const eyeSide = req.query.eyeSide as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { exams, total } = await ophthalmologyFundusService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            eyeSide,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, exams, { page, limit, total });
    } catch (error) {
        console.error('Get ophthalmology fundus exams error:', error);
        sendError(res, 'Failed to fetch ophthalmology fundus exams', 500);
    }
};

export const getOphthFundusExamById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const exam = await ophthalmologyFundusService.findById(id);

        if (!exam) {
            sendError(res, 'Ophthalmology fundus exam not found', 404);
            return;
        }

        sendSuccess(res, exam);
    } catch (error) {
        console.error('Get ophthalmology fundus exam error:', error);
        sendError(res, 'Failed to fetch ophthalmology fundus exam', 500);
    }
};

export const createOphthFundusExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOphthFundusInput;

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

        const exam = await ophthalmologyFundusService.create(data);
        sendSuccess(res, exam, 'Ophthalmology fundus exam created successfully', 201);
    } catch (error) {
        console.error('Create ophthalmology fundus exam error:', error);
        sendError(res, 'Failed to create ophthalmology fundus exam', 500);
    }
};

export const updateOphthFundusExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOphthFundusInput;

        const existing = await ophthalmologyFundusService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology fundus exam not found', 404);
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

        const exam = await ophthalmologyFundusService.update(id, data);
        sendSuccess(res, exam, 'Ophthalmology fundus exam updated successfully');
    } catch (error) {
        console.error('Update ophthalmology fundus exam error:', error);
        sendError(res, 'Failed to update ophthalmology fundus exam', 500);
    }
};

export const deleteOphthFundusExam = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await ophthalmologyFundusService.findById(id);
        if (!existing) {
            sendError(res, 'Ophthalmology fundus exam not found', 404);
            return;
        }

        await ophthalmologyFundusService.delete(id);
        sendSuccess(res, null, 'Ophthalmology fundus exam deleted successfully');
    } catch (error) {
        console.error('Delete ophthalmology fundus exam error:', error);
        sendError(res, 'Failed to delete ophthalmology fundus exam', 500);
    }
};
