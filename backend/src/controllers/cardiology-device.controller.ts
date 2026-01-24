import { Request, Response } from 'express';
import { CardiologyDeviceStatus } from '@prisma/client';
import prisma from '../config/database';
import { cardiologyDeviceService } from '../services/cardiology-device.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateCardiologyDeviceInput, UpdateCardiologyDeviceInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getCardiologyDevices = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as CardiologyDeviceStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { devices, total } = await cardiologyDeviceService.list({
            page,
            limit,
            search,
            status,
            patientId,
            providerId,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, devices, { page, limit, total });
    } catch (error) {
        console.error('Get cardiology devices error:', error);
        sendError(res, 'Failed to fetch cardiology devices', 500);
    }
};

export const getCardiologyDeviceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const device = await cardiologyDeviceService.findById(id);

        if (!device) {
            sendError(res, 'Cardiology device not found', 404);
            return;
        }

        sendSuccess(res, device);
    } catch (error) {
        console.error('Get cardiology device error:', error);
        sendError(res, 'Failed to fetch cardiology device', 500);
    }
};

export const createCardiologyDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateCardiologyDeviceInput;

        const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        if (data.providerId) {
            const provider = await prisma.user.findUnique({ where: { id: data.providerId } });
            if (!provider || !providerRoles.includes(provider.role) || !provider.isActive) {
                sendError(res, 'Provider must be an active clinician', 400);
                return;
            }
        }

        const device = await cardiologyDeviceService.create(data);
        sendSuccess(res, device, 'Cardiology device created successfully', 201);
    } catch (error) {
        console.error('Create cardiology device error:', error);
        sendError(res, 'Failed to create cardiology device', 500);
    }
};

export const updateCardiologyDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateCardiologyDeviceInput;

        const existing = await cardiologyDeviceService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology device not found', 404);
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

        const device = await cardiologyDeviceService.update(id, data);
        sendSuccess(res, device, 'Cardiology device updated successfully');
    } catch (error) {
        console.error('Update cardiology device error:', error);
        sendError(res, 'Failed to update cardiology device', 500);
    }
};

export const deleteCardiologyDevice = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await cardiologyDeviceService.findById(id);
        if (!existing) {
            sendError(res, 'Cardiology device not found', 404);
            return;
        }

        await cardiologyDeviceService.delete(id);
        sendSuccess(res, null, 'Cardiology device deleted successfully');
    } catch (error) {
        console.error('Delete cardiology device error:', error);
        sendError(res, 'Failed to delete cardiology device', 500);
    }
};
