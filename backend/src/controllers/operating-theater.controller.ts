import { Request, Response } from 'express';
import prisma from '../config/database';
import { operatingTheaterService } from '../services/operating-theater.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateOperatingTheaterInput, UpdateOperatingTheaterInput } from '../utils/validators';

export const getOperatingTheaters = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { theaters, total } = await operatingTheaterService.list({
            page,
            limit,
            search,
            status,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, theaters, { page, limit, total });
    } catch (error) {
        console.error('Get operating theaters error:', error);
        sendError(res, 'Failed to fetch operating theaters', 500);
    }
};

export const getOperatingTheaterById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const theater = await operatingTheaterService.findById(id);

        if (!theater) {
            sendError(res, 'Operating theater not found', 404);
            return;
        }

        sendSuccess(res, theater);
    } catch (error) {
        console.error('Get operating theater error:', error);
        sendError(res, 'Failed to fetch operating theater', 500);
    }
};

export const createOperatingTheater = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateOperatingTheaterInput;

        const existing = await prisma.operatingTheater.findUnique({
            where: { name: data.name },
        });

        if (existing) {
            sendError(res, 'Operating theater with this name already exists', 400);
            return;
        }

        const theater = await operatingTheaterService.create(data);
        sendSuccess(res, theater, 'Operating theater created successfully', 201);
    } catch (error) {
        console.error('Create operating theater error:', error);
        sendError(res, 'Failed to create operating theater', 500);
    }
};

export const updateOperatingTheater = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateOperatingTheaterInput;

        const existing = await operatingTheaterService.findById(id);
        if (!existing) {
            sendError(res, 'Operating theater not found', 404);
            return;
        }

        if (data.name && data.name !== existing.name) {
            const duplicate = await prisma.operatingTheater.findUnique({
                where: { name: data.name },
            });
            if (duplicate) {
                sendError(res, 'Operating theater with this name already exists', 400);
                return;
            }
        }

        const theater = await operatingTheaterService.update(id, data);
        sendSuccess(res, theater, 'Operating theater updated successfully');
    } catch (error) {
        console.error('Update operating theater error:', error);
        sendError(res, 'Failed to update operating theater', 500);
    }
};

export const deleteOperatingTheater = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await operatingTheaterService.findById(id);
        if (!existing) {
            sendError(res, 'Operating theater not found', 404);
            return;
        }

        await operatingTheaterService.delete(id);
        sendSuccess(res, null, 'Operating theater deleted successfully');
    } catch (error) {
        console.error('Delete operating theater error:', error);
        sendError(res, 'Failed to delete operating theater', 500);
    }
};