import { Request, Response } from 'express';
import { DeliveryMode } from '@prisma/client';
import prisma from '../config/database';
import { obgynDeliveryService } from '../services/obgyn-delivery.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateObgynDeliveryInput, UpdateObgynDeliveryInput } from '../utils/validators';

const providerRoles = ['DOCTOR', 'NURSE'];

export const getObgynDeliveries = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const deliveryMode = req.query.deliveryMode as DeliveryMode | undefined;
        const patientId = req.query.patientId as string | undefined;
        const providerId = req.query.providerId as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { deliveries, total } = await obgynDeliveryService.list({
            page,
            limit,
            search,
            deliveryMode,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, deliveries, { page, limit, total });
    } catch (error) {
        console.error('Get OBGYN deliveries error:', error);
        sendError(res, 'Failed to fetch OBGYN deliveries', 500);
    }
};

export const getObgynDeliveryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const delivery = await obgynDeliveryService.findById(id);

        if (!delivery) {
            sendError(res, 'OBGYN delivery not found', 404);
            return;
        }

        sendSuccess(res, delivery);
    } catch (error) {
        console.error('Get OBGYN delivery error:', error);
        sendError(res, 'Failed to fetch OBGYN delivery', 500);
    }
};

export const createObgynDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateObgynDeliveryInput;

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

        const delivery = await obgynDeliveryService.create(data);
        sendSuccess(res, delivery, 'OBGYN delivery created successfully', 201);
    } catch (error) {
        console.error('Create OBGYN delivery error:', error);
        sendError(res, 'Failed to create OBGYN delivery', 500);
    }
};

export const updateObgynDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateObgynDeliveryInput;

        const existing = await obgynDeliveryService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN delivery not found', 404);
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

        const delivery = await obgynDeliveryService.update(id, data);
        sendSuccess(res, delivery, 'OBGYN delivery updated successfully');
    } catch (error) {
        console.error('Update OBGYN delivery error:', error);
        sendError(res, 'Failed to update OBGYN delivery', 500);
    }
};

export const deleteObgynDelivery = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await obgynDeliveryService.findById(id);
        if (!existing) {
            sendError(res, 'OBGYN delivery not found', 404);
            return;
        }

        await obgynDeliveryService.delete(id);
        sendSuccess(res, null, 'OBGYN delivery deleted successfully');
    } catch (error) {
        console.error('Delete OBGYN delivery error:', error);
        sendError(res, 'Failed to delete OBGYN delivery', 500);
    }
};
