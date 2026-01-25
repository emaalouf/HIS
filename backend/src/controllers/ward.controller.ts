import { Request, Response } from 'express';
import prisma from '../config/database';
import { wardService } from '../services/ward.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateWardInput, UpdateWardInput } from '../utils/validators';

export const getWards = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const departmentId = req.query.departmentId as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { wards, total } = await wardService.list({
            page,
            limit,
            search,
            isActive,
            departmentId,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, wards, { page, limit, total });
    } catch (error) {
        console.error('Get wards error:', error);
        sendError(res, 'Failed to fetch wards', 500);
    }
};

export const getWardById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const ward = await wardService.findById(id);

        if (!ward) {
            sendError(res, 'Ward not found', 404);
            return;
        }

        sendSuccess(res, ward);
    } catch (error) {
        console.error('Get ward error:', error);
        sendError(res, 'Failed to fetch ward', 500);
    }
};

export const createWard = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateWardInput;

        if (data.departmentId) {
            const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
            if (!department) {
                sendError(res, 'Department not found', 404);
                return;
            }
        }

        const ward = await wardService.create(data);
        sendSuccess(res, ward, 'Ward created successfully', 201);
    } catch (error) {
        console.error('Create ward error:', error);
        sendError(res, 'Failed to create ward', 500);
    }
};

export const updateWard = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateWardInput;

        const existing = await wardService.findById(id);
        if (!existing) {
            sendError(res, 'Ward not found', 404);
            return;
        }

        if (data.departmentId) {
            const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
            if (!department) {
                sendError(res, 'Department not found', 404);
                return;
            }
        }

        const ward = await wardService.update(id, data);
        sendSuccess(res, ward, 'Ward updated successfully');
    } catch (error) {
        console.error('Update ward error:', error);
        sendError(res, 'Failed to update ward', 500);
    }
};

export const deleteWard = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await wardService.findById(id);
        if (!existing) {
            sendError(res, 'Ward not found', 404);
            return;
        }

        await wardService.delete(id);
        sendSuccess(res, null, 'Ward deleted successfully');
    } catch (error) {
        console.error('Delete ward error:', error);
        sendError(res, 'Failed to delete ward', 500);
    }
};
