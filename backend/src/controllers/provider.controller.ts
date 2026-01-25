import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { providerService } from '../services/provider.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateProviderInput, UpdateProviderInput } from '../utils/validators';

const generateTempPassword = (): string =>
    crypto.randomBytes(12).toString('base64url');

export const getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const roleParam = req.query.role as string | undefined;
        const role = roleParam && Object.values(Role).includes(roleParam as Role)
            ? (roleParam as Role)
            : undefined;
        const specialty = req.query.specialty as string | undefined;
        const departmentId = req.query.departmentId as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { providers, total } = await providerService.list({
            page,
            limit,
            search,
            role,
            specialty,
            departmentId,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, providers, { page, limit, total });
    } catch (error) {
        console.error('Get providers error:', error);
        sendError(res, 'Failed to fetch providers', 500);
    }
};

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const provider = await providerService.findById(id);

        if (!provider) {
            sendError(res, 'Provider not found', 404);
            return;
        }

        sendSuccess(res, provider);
    } catch (error) {
        console.error('Get provider error:', error);
        sendError(res, 'Failed to fetch provider', 500);
    }
};

export const createProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateProviderInput;

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            sendError(res, 'Email already registered', 400);
            return;
        }

        if (data.departmentId) {
            const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
            if (!department) {
                sendError(res, 'Department not found', 404);
                return;
            }
        }

        const rawPassword = data.password || generateTempPassword();
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const provider = await providerService.create({
            ...data,
            password: hashedPassword,
        });

        sendSuccess(res, provider, 'Provider created successfully', 201);
    } catch (error) {
        console.error('Create provider error:', error);
        sendError(res, 'Failed to create provider', 500);
    }
};

export const updateProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateProviderInput;

        const existing = await providerService.findById(id);
        if (!existing) {
            sendError(res, 'Provider not found', 404);
            return;
        }

        if (data.email && data.email !== existing.email) {
            const duplicate = await prisma.user.findUnique({ where: { email: data.email } });
            if (duplicate) {
                sendError(res, 'Email already registered', 400);
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

        const provider = await providerService.update(id, data);
        sendSuccess(res, provider, 'Provider updated successfully');
    } catch (error) {
        console.error('Update provider error:', error);
        sendError(res, 'Failed to update provider', 500);
    }
};

export const deleteProvider = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await providerService.findById(id);
        if (!existing) {
            sendError(res, 'Provider not found', 404);
            return;
        }

        await providerService.delete(id);
        sendSuccess(res, null, 'Provider deleted successfully');
    } catch (error) {
        console.error('Delete provider error:', error);
        sendError(res, 'Failed to delete provider', 500);
    }
};
