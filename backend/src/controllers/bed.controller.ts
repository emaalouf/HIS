import { Request, Response } from 'express';
import { BedStatus } from '@prisma/client';
import prisma from '../config/database';
import { bedService } from '../services/bed.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateBedInput, UpdateBedInput } from '../utils/validators';

export const getBeds = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as BedStatus | undefined;
        const wardId = req.query.wardId as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { beds, total } = await bedService.list({
            page,
            limit,
            search,
            status,
            wardId,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, beds, { page, limit, total });
    } catch (error) {
        console.error('Get beds error:', error);
        sendError(res, 'Failed to fetch beds', 500);
    }
};

export const getBedById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const bed = await bedService.findById(id);

        if (!bed) {
            sendError(res, 'Bed not found', 404);
            return;
        }

        sendSuccess(res, bed);
    } catch (error) {
        console.error('Get bed error:', error);
        sendError(res, 'Failed to fetch bed', 500);
    }
};

export const createBed = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateBedInput;

        const ward = await prisma.ward.findUnique({ where: { id: data.wardId } });
        if (!ward) {
            sendError(res, 'Ward not found', 404);
            return;
        }

        const bed = await bedService.create(data);
        sendSuccess(res, bed, 'Bed created successfully', 201);
    } catch (error) {
        console.error('Create bed error:', error);
        sendError(res, 'Failed to create bed', 500);
    }
};

export const updateBed = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateBedInput;

        const existing = await bedService.findById(id);
        if (!existing) {
            sendError(res, 'Bed not found', 404);
            return;
        }

        if (data.wardId) {
            const ward = await prisma.ward.findUnique({ where: { id: data.wardId } });
            if (!ward) {
                sendError(res, 'Ward not found', 404);
                return;
            }
        }

        const bed = await bedService.update(id, data);
        sendSuccess(res, bed, 'Bed updated successfully');
    } catch (error) {
        console.error('Update bed error:', error);
        sendError(res, 'Failed to update bed', 500);
    }
};

export const deleteBed = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await bedService.findById(id);
        if (!existing) {
            sendError(res, 'Bed not found', 404);
            return;
        }

        await bedService.delete(id);
        sendSuccess(res, null, 'Bed deleted successfully');
    } catch (error) {
        console.error('Delete bed error:', error);
        sendError(res, 'Failed to delete bed', 500);
    }
};
