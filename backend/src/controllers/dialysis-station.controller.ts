import { Request, Response } from 'express';
import { dialysisStationService } from '../services/dialysis-station.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDialysisStationInput, UpdateDialysisStationInput } from '../utils/validators';

export const getDialysisStations = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const status = req.query.status as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { stations, total } = await dialysisStationService.list({
            page,
            limit,
            search,
            status,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, stations, { page, limit, total });
    } catch (error) {
        console.error('Get dialysis stations error:', error);
        sendError(res, 'Failed to fetch dialysis stations', 500);
    }
};

export const getDialysisStationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const station = await dialysisStationService.findById(id);

        if (!station) {
            sendError(res, 'Dialysis station not found', 404);
            return;
        }

        sendSuccess(res, station);
    } catch (error) {
        console.error('Get dialysis station error:', error);
        sendError(res, 'Failed to fetch dialysis station', 500);
    }
};

export const createDialysisStation = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDialysisStationInput;
        const station = await dialysisStationService.create(data);
        sendSuccess(res, station, 'Dialysis station created successfully', 201);
    } catch (error) {
        console.error('Create dialysis station error:', error);
        sendError(res, 'Failed to create dialysis station', 500);
    }
};

export const updateDialysisStation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDialysisStationInput;

        const existing = await dialysisStationService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis station not found', 404);
            return;
        }

        const station = await dialysisStationService.update(id, data);
        sendSuccess(res, station, 'Dialysis station updated successfully');
    } catch (error) {
        console.error('Update dialysis station error:', error);
        sendError(res, 'Failed to update dialysis station', 500);
    }
};

export const deleteDialysisStation = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await dialysisStationService.findById(id);
        if (!existing) {
            sendError(res, 'Dialysis station not found', 404);
            return;
        }

        await dialysisStationService.delete(id);
        sendSuccess(res, null, 'Dialysis station deleted successfully');
    } catch (error) {
        console.error('Delete dialysis station error:', error);
        sendError(res, 'Failed to delete dialysis station', 500);
    }
};
