import { Request, Response } from 'express';
import prisma from '../config/database';
import { dialysisFlowsheetService } from '../services/dialysis-flowsheet.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import {
    CreateDialysisFlowsheetInput,
    UpdateDialysisFlowsheetInput,
} from '../utils/validators';

export const getDialysisFlowsheets = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sessionId = req.query.sessionId as string | undefined;
        const search = req.query.search as string | undefined;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const { entries, total } = await dialysisFlowsheetService.list({
            page,
            limit,
            sessionId,
            search,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, entries, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis flowsheets error:', error);
        sendError(res, 'Failed to fetch flowsheet entries', 500);
    }
};

export const getDialysisFlowsheetById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const entry = await dialysisFlowsheetService.findById(id);

        if (!entry) {
            sendError(res, 'Flowsheet entry not found', 404);
            return;
        }

        sendSuccess(res, entry);
    } catch (error) {
        console.error('Get dialysis flowsheet entry error:', error);
        sendError(res, 'Failed to fetch flowsheet entry', 500);
    }
};

export const createDialysisFlowsheet = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisFlowsheetInput;

        const session = await prisma.dialysisSession.findUnique({ where: { id: data.sessionId } });
        if (!session) {
            sendError(res, 'Dialysis session not found', 404);
            return;
        }

        const entry = await dialysisFlowsheetService.create(data);
        sendSuccess(res, entry, 'Flowsheet entry created successfully', 201);
    } catch (error) {
        console.error('Create dialysis flowsheet error:', error);
        sendError(res, 'Failed to create flowsheet entry', 500);
    }
};

export const updateDialysisFlowsheet = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisFlowsheetInput;

        const existing = await dialysisFlowsheetService.findById(id);
        if (!existing) {
            sendError(res, 'Flowsheet entry not found', 404);
            return;
        }

        if (data.sessionId) {
            const session = await prisma.dialysisSession.findUnique({ where: { id: data.sessionId } });
            if (!session) {
                sendError(res, 'Dialysis session not found', 404);
                return;
            }
        }

        const entry = await dialysisFlowsheetService.update(id, data);
        sendSuccess(res, entry, 'Flowsheet entry updated successfully');
    } catch (error) {
        console.error('Update dialysis flowsheet error:', error);
        sendError(res, 'Failed to update flowsheet entry', 500);
    }
};

export const deleteDialysisFlowsheet = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisFlowsheetService.findById(id);
        if (!existing) {
            sendError(res, 'Flowsheet entry not found', 404);
            return;
        }

        await dialysisFlowsheetService.delete(id);
        sendSuccess(res, null, 'Flowsheet entry deleted successfully');
    } catch (error) {
        console.error('Delete dialysis flowsheet error:', error);
        sendError(res, 'Failed to delete flowsheet entry', 500);
    }
};
