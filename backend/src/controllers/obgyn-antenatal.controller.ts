import { Request, Response } from 'express';
import { Trimester } from '@prisma/client';
import prisma from '../config/database';
import { obgynAntenatalService } from '../services/obgyn-antenatal.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateObgynAntenatalInput, UpdateObgynAntenatalInput } from '../utils/validators';

export const getObgynAntenatalVisits = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const pregnancyId = req.query.pregnancyId as string | undefined;
        const trimester = req.query.trimester as Trimester | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { visits, total } = await obgynAntenatalService.list({
            page,
            limit,
            search,
            pregnancyId,
            trimester,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, visits, { page, limit, total });
    } catch (error) {
        console.error('Get OBGYN antenatal visits error:', error);
        sendError(res, 'Failed to fetch OBGYN antenatal visits', 500);
    }
};

export const getObgynAntenatalVisitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const visit = await obgynAntenatalService.findById(id);

        if (!visit) {
            sendError(res, 'OBGYN antenatal visit not found', 404);
            return;
        }

        sendSuccess(res, visit);
    } catch (error) {
        console.error('Get OBGYN antenatal visit error:', error);
        sendError(res, 'Failed to fetch OBGYN antenatal visit', 500);
    }
};

export const createObgynAntenatalVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateObgynAntenatalInput;

        const pregnancy = await prisma.obgynPregnancy.findUnique({ where: { id: data.pregnancyId } });

        if (!pregnancy) {
            sendError(res, 'Pregnancy record not found', 404);
            return;
        }

        const visit = await obgynAntenatalService.create(data);
        sendSuccess(res, visit, 'OBGYN antenatal visit created successfully', 201);
    } catch (error) {
        console.error('Create OBGYN antenatal visit error:', error);
        sendError(res, 'Failed to create OBGYN antenatal visit', 500);
    }
};

export const updateObgynAntenatalVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateObgynAntenatalInput;

        const existing = await obgynAntenatalService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN antenatal visit not found', 404);
            return;
        }

        if (data.pregnancyId) {
            const pregnancy = await prisma.obgynPregnancy.findUnique({ where: { id: data.pregnancyId } });
            if (!pregnancy) {
                sendError(res, 'Pregnancy record not found', 404);
                return;
            }
        }

        const visit = await obgynAntenatalService.update(id, data);
        sendSuccess(res, visit, 'OBGYN antenatal visit updated successfully');
    } catch (error) {
        console.error('Update OBGYN antenatal visit error:', error);
        sendError(res, 'Failed to update OBGYN antenatal visit', 500);
    }
};

export const deleteObgynAntenatalVisit = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await obgynAntenatalService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN antenatal visit not found', 404);
            return;
        }

        await obgynAntenatalService.delete(id);
        sendSuccess(res, null, 'OBGYN antenatal visit deleted successfully');
    } catch (error) {
        console.error('Delete OBGYN antenatal visit error:', error);
        sendError(res, 'Failed to delete OBGYN antenatal visit', 500);
    }
};
