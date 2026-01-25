import { Request, Response } from 'express';
import { ClaimStatus } from '@prisma/client';
import prisma from '../config/database';
import { claimService } from '../services/claim.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateClaimInput, UpdateClaimInput } from '../utils/validators';

export const getClaims = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as ClaimStatus | undefined;
        const patientId = req.query.patientId as string | undefined;
        const invoiceId = req.query.invoiceId as string | undefined;
        const payerName = req.query.payerName as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { claims, total } = await claimService.list({
            page,
            limit,
            status,
            patientId,
            invoiceId,
            payerName,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, claims, { page, limit, total });
    } catch (error) {
        console.error('Get claims error:', error);
        sendError(res, 'Failed to fetch claims', 500);
    }
};

export const getClaimById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const claim = await claimService.findById(id);

        if (!claim) {
            sendError(res, 'Claim not found', 404);
            return;
        }

        sendSuccess(res, claim);
    } catch (error) {
        console.error('Get claim error:', error);
        sendError(res, 'Failed to fetch claim', 500);
    }
};

export const createClaim = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateClaimInput;

        const [invoice, patient] = await Promise.all([
            prisma.invoice.findUnique({ where: { id: data.invoiceId } }),
            prisma.patient.findUnique({ where: { id: data.patientId } }),
        ]);

        if (!invoice) {
            sendError(res, 'Invoice not found', 404);
            return;
        }

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const claim = await claimService.create(data);
        sendSuccess(res, claim, 'Claim created successfully', 201);
    } catch (error) {
        console.error('Create claim error:', error);
        sendError(res, 'Failed to create claim', 500);
    }
};

export const updateClaim = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateClaimInput;

        const existing = await claimService.findById(id);
        if (!existing) {
            sendError(res, 'Claim not found', 404);
            return;
        }

        if (data.invoiceId) {
            const invoice = await prisma.invoice.findUnique({ where: { id: data.invoiceId } });
            if (!invoice) {
                sendError(res, 'Invoice not found', 404);
                return;
            }
        }

        if (data.patientId) {
            const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
            if (!patient) {
                sendError(res, 'Patient not found', 404);
                return;
            }
        }

        const claim = await claimService.update(id, data);
        sendSuccess(res, claim, 'Claim updated successfully');
    } catch (error) {
        console.error('Update claim error:', error);
        sendError(res, 'Failed to update claim', 500);
    }
};

export const deleteClaim = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await claimService.findById(id);
        if (!existing) {
            sendError(res, 'Claim not found', 404);
            return;
        }

        await claimService.delete(id);
        sendSuccess(res, null, 'Claim deleted successfully');
    } catch (error) {
        console.error('Delete claim error:', error);
        sendError(res, 'Failed to delete claim', 500);
    }
};
