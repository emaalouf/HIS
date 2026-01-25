import { Request, Response } from 'express';
import { AdmissionStatus } from '@prisma/client';
import prisma from '../config/database';
import { admissionService } from '../services/admission.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateAdmissionInput, UpdateAdmissionInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getAdmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as AdmissionStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const wardId = req.query.wardId as string | undefined;
        const bedId = req.query.bedId as string | undefined;
        const departmentId = req.query.departmentId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { admissions, total } = await admissionService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            wardId,
            bedId,
            departmentId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, admissions, { page, limit, total });
    } catch (error) {
        console.error('Get admissions error:', error);
        sendError(res, 'Failed to fetch admissions', 500);
    }
};

export const getAdmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const admission = await admissionService.findById(id);

        if (!admission) {
            sendError(res, 'Admission not found', 404);
            return;
        }

        sendSuccess(res, admission);
    } catch (error) {
        console.error('Get admission error:', error);
        sendError(res, 'Failed to fetch admission', 500);
    }
};

export const createAdmission = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateAdmissionInput;

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

        if (data.wardId) {
            const ward = await prisma.ward.findUnique({ where: { id: data.wardId } });
            if (!ward) {
                sendError(res, 'Ward not found', 404);
                return;
            }
        }

        if (data.bedId) {
            const bed = await prisma.bed.findUnique({ where: { id: data.bedId } });
            if (!bed) {
                sendError(res, 'Bed not found', 404);
                return;
            }
        }

        if (data.departmentId) {
            const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
            if (!department) {
                sendError(res, 'Department not found', 404);
                return;
            }
        }

        const admission = await admissionService.create(data);
        sendSuccess(res, admission, 'Admission created successfully', 201);
    } catch (error) {
        console.error('Create admission error:', error);
        sendError(res, 'Failed to create admission', 500);
    }
};

export const updateAdmission = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateAdmissionInput;

        const existing = await admissionService.findById(id);
        if (!existing) {
            sendError(res, 'Admission not found', 404);
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

        if (data.wardId) {
            const ward = await prisma.ward.findUnique({ where: { id: data.wardId } });
            if (!ward) {
                sendError(res, 'Ward not found', 404);
                return;
            }
        }

        if (data.bedId) {
            const bed = await prisma.bed.findUnique({ where: { id: data.bedId } });
            if (!bed) {
                sendError(res, 'Bed not found', 404);
                return;
            }
        }

        if (data.departmentId) {
            const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
            if (!department) {
                sendError(res, 'Department not found', 404);
                return;
            }
        }

        const admission = await admissionService.update(id, data);
        sendSuccess(res, admission, 'Admission updated successfully');
    } catch (error) {
        console.error('Update admission error:', error);
        sendError(res, 'Failed to update admission', 500);
    }
};

export const deleteAdmission = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await admissionService.findById(id);
        if (!existing) {
            sendError(res, 'Admission not found', 404);
            return;
        }

        await admissionService.delete(id);
        sendSuccess(res, null, 'Admission deleted successfully');
    } catch (error) {
        console.error('Delete admission error:', error);
        sendError(res, 'Failed to delete admission', 500);
    }
};
