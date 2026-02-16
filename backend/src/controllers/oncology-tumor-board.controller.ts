import { Request, Response } from 'express';
import { TumorBoardStatus } from '@prisma/client';
import prisma from '../config/database';
import { oncologyTumorBoardService } from '../services/oncology-tumor-board.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOncologyTumorBoardInput, UpdateOncologyTumorBoardInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getOncologyTumorBoards = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as TumorBoardStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const presenterId = req.query.presenterId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { tumorBoards, total } = await oncologyTumorBoardService.list({
            page,
            limit,
            search,
            status,
            patientId,
            presenterId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, tumorBoards, { page, limit, total });
    } catch (error) {
        console.error('Get oncology tumor boards error:', error);
        sendError(res, 'Failed to fetch oncology tumor boards', 500);
    }
};

export const getOncologyTumorBoardById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const tumorBoard = await oncologyTumorBoardService.findById(id);

        if (!tumorBoard) {
            sendError(res, 'Oncology tumor board not found', 404);
            return;
        }

        sendSuccess(res, tumorBoard);
    } catch (error) {
        console.error('Get oncology tumor board error:', error);
        sendError(res, 'Failed to fetch oncology tumor board', 500);
    }
};

export const createOncologyTumorBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOncologyTumorBoardInput;

        const [patient, presenter] = await Promise.all([
            prisma.patient.findUnique({ where: { id: data.patientId } }),
            prisma.user.findUnique({ where: { id: data.presenterId } }),
        ]);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (!presenter || !providerRoles.includes(presenter.role) || !presenter.isActive) {
            sendError(res, 'Presenter must be an active clinician', 400);
            return;
        }

        const tumorBoard = await oncologyTumorBoardService.create(data);
        sendSuccess(res, tumorBoard, 'Oncology tumor board created successfully', 201);
    } catch (error) {
        console.error('Create oncology tumor board error:', error);
        sendError(res, 'Failed to create oncology tumor board', 500);
    }
};

export const updateOncologyTumorBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOncologyTumorBoardInput;

        const existing = await oncologyTumorBoardService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology tumor board not found', 404);
            return;
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        if (data.presenterId) {
            const presenter = await prisma.user.findUnique({ where: { id: data.presenterId } });
            if (!presenter || !providerRoles.includes(presenter.role) || !presenter.isActive) {
                sendError(res, 'Presenter must be an active clinician', 400);
                return;
            }
        }

        const tumorBoard = await oncologyTumorBoardService.update(id, data);
        sendSuccess(res, tumorBoard, 'Oncology tumor board updated successfully');
    } catch (error) {
        console.error('Update oncology tumor board error:', error);
        sendError(res, 'Failed to update oncology tumor board', 500);
    }
};

export const deleteOncologyTumorBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await oncologyTumorBoardService.findById(id);
        if (!existing) {
            sendError(res, 'Oncology tumor board not found', 404);
            return;
        }

        await oncologyTumorBoardService.delete(id);
        sendSuccess(res, null, 'Oncology tumor board deleted successfully');
    } catch (error) {
        console.error('Delete oncology tumor board error:', error);
        sendError(res, 'Failed to delete oncology tumor board', 500);
    }
};
