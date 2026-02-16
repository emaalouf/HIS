import { Request, Response } from 'express';
import prisma from '../config/database';
import { psychiatryAssessmentService } from '../services/psychiatry-assessment.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreatePsychiatryAssessmentInput, UpdatePsychiatryAssessmentInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getPsychiatryAssessments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const assessmentType = req.query.assessmentType as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { assessments, total } = await psychiatryAssessmentService.list({
            page,
            limit,
            search,
            patientId,
            providerId,
            assessmentType,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, assessments, { page, limit, total });
    } catch (error) {
        console.error('Get psychiatry assessments error:', error);
        sendError(res, 'Failed to fetch psychiatry assessments', 500);
    }
};

export const getPsychiatryAssessmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const assessment = await psychiatryAssessmentService.findById(id);

        if (!assessment) {
            sendError(res, 'Psychiatry assessment not found', 404);
            return;
        }

        sendSuccess(res, assessment);
    } catch (error) {
        console.error('Get psychiatry assessment error:', error);
        sendError(res, 'Failed to fetch psychiatry assessment', 500);
    }
};

export const createPsychiatryAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePsychiatryAssessmentInput;

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

        const assessment = await psychiatryAssessmentService.create(data);
        sendSuccess(res, assessment, 'Psychiatry assessment created successfully', 201);
    } catch (error) {
        console.error('Create psychiatry assessment error:', error);
        sendError(res, 'Failed to create psychiatry assessment', 500);
    }
};

export const updatePsychiatryAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePsychiatryAssessmentInput;

        const existing = await psychiatryAssessmentService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry assessment not found', 404);
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

        const assessment = await psychiatryAssessmentService.update(id, data);
        sendSuccess(res, assessment, 'Psychiatry assessment updated successfully');
    } catch (error) {
        console.error('Update psychiatry assessment error:', error);
        sendError(res, 'Failed to update psychiatry assessment', 500);
    }
};

export const deletePsychiatryAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await psychiatryAssessmentService.findById(id);
        if (!existing) {
            sendError(res, 'Psychiatry assessment not found', 404);
            return;
        }

        await psychiatryAssessmentService.delete(id);
        sendSuccess(res, null, 'Psychiatry assessment deleted successfully');
    } catch (error) {
        console.error('Delete psychiatry assessment error:', error);
        sendError(res, 'Failed to delete psychiatry assessment', 500);
    }
};
