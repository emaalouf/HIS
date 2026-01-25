import { Request, Response } from 'express';
import prisma from '../config/database';
import { specialtyService } from '../services/specialty.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateSpecialtyInput, UpdateSpecialtyInput } from '../utils/validators';

export const getSpecialties = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { specialties, total } = await specialtyService.list({
            page,
            limit,
            search,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, specialties, { page, limit, total });
    } catch (error) {
        console.error('Get specialties error:', error);
        sendError(res, 'Failed to fetch specialties', 500);
    }
};

export const getSpecialtyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const specialty = await specialtyService.findById(id);

        if (!specialty) {
            sendError(res, 'Specialty not found', 404);
            return;
        }

        sendSuccess(res, specialty);
    } catch (error) {
        console.error('Get specialty error:', error);
        sendError(res, 'Failed to fetch specialty', 500);
    }
};

export const createSpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateSpecialtyInput;

        const existing = await prisma.specialty.findUnique({
            where: { name: data.name },
        });
        if (existing) {
            sendError(res, 'Specialty with this name already exists', 400);
            return;
        }

        const specialty = await specialtyService.create(data);
        sendSuccess(res, specialty, 'Specialty created successfully', 201);
    } catch (error) {
        console.error('Create specialty error:', error);
        sendError(res, 'Failed to create specialty', 500);
    }
};

export const updateSpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateSpecialtyInput;

        const existing = await specialtyService.findById(id);
        if (!existing) {
            sendError(res, 'Specialty not found', 404);
            return;
        }

        if (data.name && data.name !== existing.name) {
            const duplicate = await prisma.specialty.findUnique({
                where: { name: data.name },
            });
            if (duplicate) {
                sendError(res, 'Specialty with this name already exists', 400);
                return;
            }
        }

        const specialty = await specialtyService.update(id, data);
        sendSuccess(res, specialty, 'Specialty updated successfully');
    } catch (error) {
        console.error('Update specialty error:', error);
        sendError(res, 'Failed to update specialty', 500);
    }
};

export const deleteSpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await specialtyService.findById(id);
        if (!existing) {
            sendError(res, 'Specialty not found', 404);
            return;
        }

        await specialtyService.delete(id);
        sendSuccess(res, null, 'Specialty deleted successfully');
    } catch (error) {
        console.error('Delete specialty error:', error);
        sendError(res, 'Failed to delete specialty', 500);
    }
};
